import {
	CalcEvaluationContext,
	computeEquation,
	isCalcEquation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';
import {
	getModeInternals,
	isModeValue,
	ModeInstance,
	ModeValue,
} from '@arbor-css/modes';
import { ArborPreset } from '@arbor-css/preset';
import {
	isToken,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
	Token,
} from '@arbor-css/tokens';
import { toFlatKeys } from '@arbor-css/util';
import { flattenAndApplyTokenValues } from '../util/flattenAndApplyTokenValues.js';

/**
 * Constructs a proxy which computes the resolved
 * value of any assigned property on demand and caches
 * the result.
 *
 * Mode values can be CSS equations or token references,
 * which require recursive resolution to get a final string
 * value which is required for calculation, so this both
 * resolves those to strings and makes sure we don't
 * recompute the same things over and over.
 */
function createResolvingPropertyValuesProxy(
	propertyValues: Record<string, ModeValue>,
	allowMissing: boolean = false,
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
					// does this token reference another property in our values?
					// if so, follow that thread.
					if (value.name in propertyValues) {
						const referencedValue = propertyValuesProxy[value.name];
						cache[prop] = referencedValue;
					} else {
						// otherwise, just resolve to the token's var() reference since we have no more information about it at this point
						cache[prop] = value.var;
					}
					return cache[prop];
				} else if (isCalcEquation(value)) {
					// here's where it gets fun
					cache[prop] = printComputationResult(
						computeEquation(value, {
							// we reference ourselves to continue resolving
							// down the chain.
							propertyValues: propertyValuesProxy,
						} as CalcEvaluationContext),
					);
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

export function modeToCss<TModeShape extends SimpleTokenSchema>(
	mode: ModeInstance<TModeShape>,
	preset: ArborPreset<TModeShape>,
): string {
	const flatValues = toFlatKeys<ModeValue>(mode, isModeValue, {
		separator: '-',
	});
	const flatTokens = toFlatKeys<Token>(preset.$.mode, isToken, {
		separator: '-',
	});
	const calcContext: CalcEvaluationContext = {
		propertyValues: createResolvingPropertyValuesProxy(
			flattenAndApplyTokenValues(preset.$.mode, mode, { allowMissing: true }),
			true,
		),
	};

	const modeInternals = getModeInternals(mode);

	const cssVars: Record<string, string> = {};
	const lowPriorityVars: Record<string, string> = {};

	for (const key in flatValues) {
		const value = flatValues[key];
		const tokenVar = flatTokens[key];
		if (!tokenVar) {
			// ignore values which don't align with schema
			continue;
		}

		if (isToken(value)) {
			cssVars[tokenVar.name] = value.var;
		} else if (isCalcEquation(value)) {
			// bake the equation to get the simplest value we can know ahead of time
			cssVars[tokenVar.name] = printComputationResult(
				computeEquation(value, calcContext),
			);
		} else if (typeof value === 'string' || typeof value === 'number') {
			cssVars[tokenVar.name] = value.toString();
		} else {
			throw new Error(
				`Invalid value for token ${tokenVar.name}: ${value}. Must be a string, number, or $token`,
			);
		}

		// If this value corresponds to a token in the base mode, we need to check if any other base mode values depend on it and include them as well since CSS custom properties are eagerly evaluated.
		const baseDeps = getBaseModeDependents(
			preset.baseMode,
			tokenVar,
			preset.$.mode,
		);
		Object.assign(lowPriorityVars, baseDeps);
	}

	const valuesCss = Object.entries({
		...lowPriorityVars,
		...cssVars,
	}).reduce((acc, [key, value]) => `${acc}${key}: ${value};\n`, '');
	const content = [valuesCss, preset.modeSchema.extraCss]
		.filter(Boolean)
		.join('\n');

	const simpleSelector = `.\\@mode-${modeInternals.name}`;
	const selectors = [simpleSelector, ...(modeInternals.extraSelectors ?? [])];

	if (mode === preset.baseMode) {
		// base mode values are applied to :root and all scheme selectors since they can be referenced by any mode and we want them to update when the base mode changes
		selectors.push(
			...selectors.map((s) => s.replace(`.\\@mode-${mode.$name}`, ':root')),
		);
	}

	return `${selectors.join(', ')} {
	${preset.$.system.meta.modeName.assign(modeInternals.name)}
	${content}
	${modeInternals.extraCss ?? ''}
}
`
		.replace(/\s+/g, ' ')
		.replaceAll('; ', ';\n\t')
		.replaceAll('{ ', '{\n\t');
}

/**
 * For a given Token, returns which values in the base mode depend on it.
 * When any mode defines a value, we check the corresponding token with
 * this function to decide if we need to interpolate any base values that
 * must be recomputed alongside it since CSS custom properties are eagerly
 * evaluated at declaration and won't update due to downstream changes to
 * properties they derive from.
 */
function getBaseModeDependents(
	baseMode: ModeInstance<any>,
	token: Token,
	modeTokens: SimpleTokensAsTokenDefinitions<any>,
	visiting: string[] = [],
): Record<string, string> {
	const cycleStart = visiting.findIndex((name) => name === token.name);
	if (cycleStart !== -1) {
		// note: this only detects cycles in the base mode, not
		// in derived modes. is that needed?
		const cycleChain = [...visiting.slice(cycleStart), token.name].join(' -> ');
		throw new Error(
			`Circular dependency detected in mode ${baseMode.$name}: ${cycleChain}`,
		);
	}
	const nextVisiting = [...visiting, token.name];
	const dependents: Record<string, string> = {};
	const flatBase = toFlatKeys(baseMode, isModeValue, { separator: '-' });
	const flatTokens = toFlatKeys<Token>(modeTokens, isToken, {
		separator: '-',
	});
	for (const key in flatBase) {
		const value = flatBase[key];
		if (isCalcEquation(value)) {
			if (value.tokens.some((dep) => dep.name === token.name)) {
				const tokenForKey = flatTokens[key];
				if (!tokenForKey) {
					continue;
				}
				dependents[tokenForKey.name] = printEquation(value);
				// recurse to find any values that depend on this dependent as well
				Object.assign(
					dependents,
					getBaseModeDependents(
						baseMode,
						tokenForKey,
						modeTokens,
						nextVisiting,
					),
				);
			}
		} else if (isToken(value)) {
			if (value.name === token.name) {
				const tokenForKey = flatTokens[key];
				if (!tokenForKey) {
					continue;
				}
				dependents[tokenForKey.name] = value.var;
				// recurse to find any values that depend on this dependent as well
				Object.assign(
					dependents,
					getBaseModeDependents(
						baseMode,
						tokenForKey,
						modeTokens,
						nextVisiting,
					),
				);
			}
		}
	}
	return dependents;
}
