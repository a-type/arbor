import {
	CssResolutionContext,
	CssSimplifier,
	isCss,
	resolveCss,
} from '@arbor-css/css-eval';
import { getModeInternals, ModeInstance, ModeValue } from '@arbor-css/modes';
import { ArborPreset } from '@arbor-css/preset';
import { isToken, SimpleTokenSchema, Token } from '@arbor-css/tokens';
import { toFlatKeys } from '@arbor-css/util';
import { flattenAndApplyTokenValues } from './flattenAndApplyTokenValues.js';

type PropertyValueMap = Record<string, ModeValue>;

export type ModeTokenGraphNode = {
	token: Token;
	raw: ModeValue;
	computed: string;
	explicit: boolean;
	dependencies: string[];
	dependents: string[];
};

export type ModeTokenGraph = {
	modeName: string;
	nodes: Record<string, ModeTokenGraphNode>;
	roots: string[];
};

/**
 * Constructs a dependency graph for a mode by combining the base mode values
 * with any explicit overrides for the current mode.
 */
export function buildModeTokenGraph<TModeShape extends SimpleTokenSchema>(
	mode: ModeInstance<TModeShape>,
	preset: ArborPreset<TModeShape>,
	options: {
		skipBaking?: boolean;
		simplifier?: CssSimplifier;
	},
): ModeTokenGraph {
	const modeInternals = getModeInternals(mode);
	const flatTokens = toFlatKeys<Token>(preset.$.mode, isToken, {
		separator: '-',
	});
	const explicitValues = flattenAndApplyTokenValues(preset.$.mode, mode, {
		allowMissing: true,
	});
	const baseValues = flattenAndApplyTokenValues(
		preset.$.mode,
		preset.baseMode,
		{
			allowMissing: false,
		},
	);
	const rawValues: PropertyValueMap = {
		...baseValues,
		...explicitValues,
	};
	const resolvedValues = createResolvingPropertyValuesProxy(rawValues, {
		allowMissing: true,
		skipBaking: options.skipBaking,
		simplifier: options.simplifier,
	});
	const explicitNames = new Set(Object.keys(explicitValues));

	const nodes: Record<string, ModeTokenGraphNode> = {};
	for (const key in flatTokens) {
		const token = flatTokens[key];
		const raw = rawValues[token.name];
		if (raw === undefined) {
			throw new Error(
				`Missing value for token ${token.name} when building mode graph for mode ${modeInternals.name}.`,
			);
		}

		const explicit = explicitNames.has(token.name);
		nodes[token.name] = {
			token,
			raw,
			computed: resolveGraphValue(raw, {
				skipBaking: options.skipBaking ?? !explicit,
				propertyValues: resolvedValues,
				simplifier: options.simplifier,
			}),
			explicit,
			dependencies: getGraphDependencies(raw),
			dependents: [],
		};
	}

	for (const key in flatTokens) {
		const token = flatTokens[key];
		const node = nodes[token.name];
		for (const dependencyName of node.dependencies) {
			const dependency = nodes[dependencyName];
			if (dependency) {
				dependency.dependents.push(node.token.name);
			}
		}
	}

	return {
		modeName: modeInternals.name,
		nodes,
		roots: Object.keys(explicitValues).filter((name) => name in nodes),
	};
}

/**
 * Returns the graph nodes in the order they should be emitted to CSS.
 * Nodes are visited from explicit mode entries, with dependents emitted first
 * so upstream declarations remain available for CSS custom properties.
 */
export function walkModeTokenGraph(
	graph: ModeTokenGraph,
): ModeTokenGraphNode[] {
	const emitted = new Set<string>();
	const visiting: string[] = [];
	const result: ModeTokenGraphNode[] = [];

	function emit(tokenName: string) {
		if (emitted.has(tokenName)) {
			return;
		}

		const node = graph.nodes[tokenName];
		if (!node) {
			return;
		}

		emitted.add(tokenName);
		result.push(node);
	}

	function visitDependents(tokenName: string) {
		const node = graph.nodes[tokenName];
		if (!node) {
			return;
		}

		if (visiting.includes(tokenName)) {
			const cycleStart = visiting.findIndex((name) => name === tokenName);
			const cycleChain = [...visiting.slice(cycleStart), tokenName].join(
				' -> ',
			);
			throw new Error(
				`Circular dependency detected in mode ${graph.modeName}: ${cycleChain}`,
			);
		}

		visiting.push(tokenName);
		for (const dependentName of node.dependents) {
			if (!emitted.has(dependentName)) {
				emit(dependentName);
				visitDependents(dependentName);
			}
		}
		visiting.pop();
	}

	for (const root of graph.roots) {
		if (!emitted.has(root)) {
			visitDependents(root);
			emit(root);
		}
	}

	return result;
}

function resolveGraphValue(
	rawValue: ModeValue,
	context: CssResolutionContext,
): string {
	if (typeof rawValue === 'string' || typeof rawValue === 'number') {
		return rawValue.toString();
	}

	if (isToken(rawValue)) {
		return rawValue.var;
	}

	if (isCss(rawValue)) {
		return resolveCss(rawValue, context);
	}

	throw new Error(
		`Invalid mode token graph value: ${JSON.stringify(rawValue)}. Must be a string, number, token reference, or calc equation.`,
	);
}

function getGraphDependencies(rawValue: ModeValue): string[] {
	if (isToken(rawValue)) {
		return [rawValue.name];
	}

	if (isCss(rawValue)) {
		return rawValue.tokens.map((token) => token.name);
	}

	return [];
}

/**
 * Constructs a proxy which computes the resolved value of any assigned
 * property on demand and caches the result.
 */
function createResolvingPropertyValuesProxy(
	propertyValues: PropertyValueMap,
	{
		allowMissing = false,
		skipBaking,
		simplifier,
	}: {
		allowMissing?: boolean;
		skipBaking?: boolean;
		simplifier?: CssSimplifier;
	},
): Record<string, string> {
	const cache: Record<string, string> = {};
	const resolvingStack: string[] = [];
	const resolvingSet = new Set<string>();

	const propertyValuesProxy = new Proxy({} as Record<string, string>, {
		get(_, prop: string | symbol) {
			if (typeof prop !== 'string') {
				return undefined;
			}

			if (prop in cache) {
				return cache[prop];
			}

			if (resolvingSet.has(prop)) {
				const cycleStart = resolvingStack.findIndex((name) => name === prop);
				const cycleChain = [...resolvingStack.slice(cycleStart), prop].join(
					' -> ',
				);
				throw new Error(
					`Circular dependency detected during property resolution: ${cycleChain}`,
				);
			}

			resolvingStack.push(prop);
			resolvingSet.add(prop);

			const value = propertyValues[prop];
			try {
				if (typeof value === 'string' || typeof value === 'number') {
					cache[prop] = value.toString();
					return cache[prop];
				} else if (isToken(value)) {
					if (value.name in propertyValues) {
						const referencedValue = propertyValuesProxy[value.name];
						cache[prop] = referencedValue;
					} else {
						cache[prop] = value.var;
					}
					return cache[prop];
				} else if (isCss(value)) {
					cache[prop] = resolveCss(value, {
						propertyValues: propertyValuesProxy,
						skipBaking,
						simplifier,
					});
					return cache[prop];
				} else if (value === undefined) {
					if (!allowMissing) {
						throw new Error(
							`Missing value for property ${prop} during resolution.`,
						);
					} else {
						return undefined;
					}
				} else {
					throw new Error(
						`Invalid value for property ${prop}: ${value}. Must be a string, number, token reference, or calc equation.`,
					);
				}
			} finally {
				resolvingSet.delete(prop);
				resolvingStack.pop();
			}
		},
	});

	return propertyValuesProxy;
}
