import { AnyArborPreset, generateStylesheet } from '@arbor-css/core';
import { printCss } from '@arbor-css/css-eval';
import {
	FunctionParam,
	isFunction,
	isFunctionParamWithMeta,
	isMixin,
} from '@arbor-css/functions';
import { stat } from 'node:fs/promises';
import postcss, { Plugin } from 'postcss';
import { loadConfig } from './loadConfig.js';

export interface ArborPluginOptions {
	/**
	 * Path to the Arbor config file.
	 * If not provided, the plugin will look in the current working directory.
	 */
	configFile?: string;

	/**
	 * Working directory used to resolve the Arbor config file.
	 * Defaults to the current working directory.
	 */
	cwd?: string;
}

const PLUGIN_NAME = 'arbor-css';

interface DepStat {
	mtimeMs: number;
	size: number;
}

interface CachedConfig {
	configPath: string;
	preset: AnyArborPreset;
	/** Stat fingerprints for every file in the dependency graph. */
	depStats: Map<string, DepStat>;
}

function parsePrefixedCall(input: string, namePrefix: string) {
	const source = input.trim();
	if (!source.startsWith(namePrefix)) return null;

	let nameEnd = namePrefix.length;
	while (nameEnd < source.length && /[\w-]/.test(source[nameEnd])) {
		nameEnd += 1;
	}
	if (nameEnd === namePrefix.length) return null;

	const name = source.slice(0, nameEnd);
	if (nameEnd === source.length) {
		return { name, args: [] as string[] };
	}
	if (source[nameEnd] !== '(' || source[source.length - 1] !== ')') {
		return null;
	}

	let depth = 0;
	for (let i = nameEnd; i < source.length; i += 1) {
		const char = source[i];
		if (char === '(') depth += 1;
		if (char === ')') depth -= 1;
		if (depth === 0 && i < source.length - 1) {
			return null;
		}
		if (depth < 0) return null;
	}
	if (depth !== 0) return null;

	return { name, args: splitCallArguments(source.slice(nameEnd + 1, -1)) };
}

function splitCallArguments(input: string) {
	const args: string[] = [];
	let depth = 0;
	let current = '';

	for (const char of input) {
		if (char === '(') {
			depth += 1;
			current += char;
			continue;
		}
		if (char === ')') {
			depth -= 1;
			current += char;
			continue;
		}
		if (char === ',' && depth === 0) {
			args.push(current.trim());
			current = '';
			continue;
		}
		current += char;
	}

	args.push(current.trim());

	return args;
}

function computeFunctionCallValue({
	input,
	config,
	node,
	helper,
}: {
	input: string;
	config: CachedConfig;
	node: postcss.Node;
	helper: { result: postcss.Result };
}) {
	const functionNamePrefix =
		config.preset.context.tokenPrefixes.functionNamePrefix;
	const parsedCall = parsePrefixedCall(input, functionNamePrefix);
	if (!parsedCall) return input;

	const fn = Object.values(config.preset.functions ?? {}).find(
		(f) => isFunction(f) && f.name === parsedCall.name,
	);
	if (!fn) {
		helper.result.warn(`[arbor-css] Unknown function: ${parsedCall.name}`, {
			plugin: PLUGIN_NAME,
			node,
		});
		return input;
	}

	const paramValues: Record<string, string> = {};
	let invalid = false;
	fn.parameters.forEach((param: FunctionParam, i: number) => {
		const paramName = isFunctionParamWithMeta(param) ? param.name : param;
		const fallback =
			isFunctionParamWithMeta(param) ? param.fallback?.toString() : undefined;
		const required = fallback === undefined;
		const providedValue = parsedCall.args[i];
		const value =
			providedValue === undefined || providedValue === '' ?
				fallback
			:	providedValue;

		if (value === undefined && required) {
			invalid = true;
			helper.result.warn(
				`[arbor-css] Missing argument for parameter "${paramName}" in function call: ${input}`,
				{
					plugin: PLUGIN_NAME,
					node,
				},
			);
			return;
		}

		if (value !== undefined) {
			paramValues[paramName] = value;
		}
	});

	if (invalid) {
		return input;
	}

	try {
		return fn.compute(paramValues).text;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(
			`[arbor-css] Error computing function "${parsedCall.name}": ${message}`,
		);
		helper.result.warn(
			`[arbor-css] Error computing function "${parsedCall.name}" — value left unchanged. ${message}`,
			{ plugin: PLUGIN_NAME, node },
		);
		return input;
	}
}

export function ArborPlugin(options: ArborPluginOptions = {}): Plugin {
	const { configFile, cwd = process.cwd() } = options;
	let cachedConfig: CachedConfig | null = null;
	let warnedAboutMissingConfig = false;

	async function getConfig(helper: {
		result: postcss.Result;
	}): Promise<CachedConfig | null> {
		if (cachedConfig) {
			try {
				// Re-stat every dependency; evict the cache if any have changed.
				let stale = false;
				for (const [depPath, stored] of cachedConfig.depStats) {
					const current = await stat(depPath);
					if (
						current.mtimeMs !== stored.mtimeMs ||
						current.size !== stored.size
					) {
						stale = true;
						break;
					}
				}
				if (!stale) return cachedConfig;
			} catch {
				// A file disappeared or is unreadable — treat as stale
				cachedConfig = null;
			}
		}

		const loaded = await loadConfig({ cwd, configFile });
		if (!loaded) {
			cachedConfig = null;
			if (!warnedAboutMissingConfig) {
				helper.result.warn(
					`[arbor-css] No arbor.config file found in ${cwd}. The @import 'arbor:css' rule was not replaced with the generated stylesheet.`,
					{ plugin: PLUGIN_NAME },
				);
				warnedAboutMissingConfig = true;
			}
			return null;
		}

		// Build fresh stat fingerprints for every dependency
		const depStats = new Map<string, DepStat>();
		for (const dep of loaded.dependencies) {
			try {
				const s = await stat(dep);
				depStats.set(dep, { mtimeMs: s.mtimeMs, size: s.size });
			} catch {
				// virtual / synthetic paths (e.g. in tests) — skip stat
			}
		}

		cachedConfig = {
			configPath: loaded.configPath,
			preset: loaded.preset,
			depStats,
		};
		return cachedConfig;
	}

	console.log(
		`[arbor-css] Using config file: ${configFile ?? 'auto-detected'}`,
	);

	return {
		postcssPlugin: PLUGIN_NAME,

		async Once(root, helper) {
			const config = await getConfig(helper);
			if (!config) {
				return;
			}

			// Tell the host bundler / build tool to watch every file in the
			// dependency graph so that changes to any imported module trigger
			// a rebuild (not just the top-level config file).
			for (const depPath of config.depStats.keys()) {
				helper.result.messages.push({
					type: 'dependency',
					plugin: PLUGIN_NAME,
					file: depPath,
				});
			}

			root.walkComments((comment) => {
				if (comment.text.trim() === 'inline-arbor-base') {
					try {
						const generatedCss = generateStylesheet(config.preset, {});
						const generatedRoot = postcss.parse(generatedCss, {
							from: config.configPath,
						});
						comment.replaceWith(...generatedRoot.nodes);
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err);
						console.error(
							`[arbor-css] Failed to generate stylesheet: ${message}`,
						);
						helper.result.warn(
							`[arbor-css] Failed to generate stylesheet — comment left in place. ${message}`,
							{ plugin: PLUGIN_NAME, node: comment },
						);
					}
				}
			});
		},

		async Declaration(decl, helper) {
			const config = await getConfig(helper);
			if (!config) {
				return;
			}

			const functionNamePrefix =
				config.preset.context.tokenPrefixes.functionNamePrefix;
			// Inline custom function calls: --fn-name(arg1, arg2, ...)
			if (decl.value.includes(functionNamePrefix)) {
				const fnCallRegex = new RegExp(
					`(${escapeRegExp(functionNamePrefix)}[\\w-]+)\\(((?:[^()]|\\([^()]*\\))*)\\)`,
					'g',
				);
				const original = decl.value;
				decl.value = decl.value.replace(fnCallRegex, (match) =>
					computeFunctionCallValue({
						input: match,
						config,
						node: decl,
						helper,
					}),
				);

				// add comment noting the original css
				decl.before(
					postcss.comment({
						text: `inlined: ${original}`,
					}),
				);
			}
		},
		async AtRule(atRule, helper) {
			if (atRule.name !== 'apply') return;
			const config = await getConfig(helper);
			if (!config) return;

			const mixinApplyCall = atRule.params.trim();
			const mixinNamePrefix =
				config.preset.context.tokenPrefixes.mixinNamePrefix;
			if (!mixinApplyCall.startsWith(mixinNamePrefix)) return;

			const parsedMixinCall = parsePrefixedCall(
				mixinApplyCall,
				mixinNamePrefix,
			);
			if (!parsedMixinCall) return;
			const mixinName = parsedMixinCall.name;
			const mixinArgs = parsedMixinCall.args;

			const mixin = Object.values(config.preset.mixins ?? {}).find(
				(m) => isMixin(m) && m.name === mixinName,
			);

			if (!mixin) {
				helper.result.warn(`[arbor-css] Unknown mixin: ${mixinName}`, {
					plugin: PLUGIN_NAME,
					node: atRule,
				});
				return;
			}

			const mixinParamValues: Record<string, string> = {};
			let invalidMixinCall = false;
			mixin.parameters.forEach((param: FunctionParam, i: number) => {
				const paramName = isFunctionParamWithMeta(param) ? param.name : param;
				const fallback =
					isFunctionParamWithMeta(param) ?
						param.fallback?.toString()
					:	undefined;
				const required = fallback === undefined;
				const providedValue = mixinArgs[i];
				const value =
					providedValue === undefined || providedValue === '' ?
						fallback
					:	providedValue;

				if (value === undefined && required) {
					invalidMixinCall = true;
					helper.result.warn(
						`[arbor-css] Missing argument for parameter "${paramName}" in mixin apply: @apply ${mixinApplyCall}`,
						{
							plugin: PLUGIN_NAME,
							node: atRule,
						},
					);
					return;
				}
				if (value !== undefined) {
					mixinParamValues[paramName] = computeFunctionCallValue({
						input: value,
						config,
						node: atRule,
						helper,
					});
				}
			});
			if (invalidMixinCall) {
				return;
			}

			// add comment telling the user which mixin this was from
			atRule.before(
				postcss.comment({
					text: `begin: ${mixinApplyCall}`,
				}),
			);

			try {
				const applied = mixin.apply(mixinParamValues);
				const printed = printCss(applied);
				const generatedRoot = postcss.parse(printed, {
					from: config.configPath,
				});
				atRule.replaceWith(
					...generatedRoot.nodes,
					postcss.comment({ text: `end: ${mixinApplyCall}` }),
				);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				console.error(
					`[arbor-css] Error applying mixin "${mixinName}": ${message}`,
				);
				helper.result.warn(
					`[arbor-css] Error applying mixin "${mixinName}" — @apply left in place. ${message}`,
					{ plugin: PLUGIN_NAME, node: atRule },
				);
				// Remove the begin comment we already inserted and bail out,
				// leaving the original @apply intact so the CSS is unchanged.
				atRule.prev()?.remove();
				return;
			}
		},
	};
}

function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

ArborPlugin.postcss = true;

export const arborCss = ArborPlugin;

export default ArborPlugin;
