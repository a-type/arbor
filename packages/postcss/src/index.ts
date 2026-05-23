import { printEquation } from '@arbor-css/calc';
import { AnyArborPreset, generateStylesheet } from '@arbor-css/core';
import {
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

interface CachedConfig {
	configPath: string;
	preset: AnyArborPreset;
	mtimeMs: number;
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
			depth = Math.max(0, depth - 1);
			current += char;
			continue;
		}
		if (char === ',' && depth === 0) {
			const value = current.trim();
			if (value) {
				args.push(value);
			}
			current = '';
			continue;
		}
		current += char;
	}

	const value = current.trim();
	if (value) {
		args.push(value);
	}

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
	fn.parameters.forEach((param, i) => {
		const paramName = isFunctionParamWithMeta(param) ? param.name : param;
		const fallback =
			isFunctionParamWithMeta(param) ? param.fallback?.toString() : undefined;
		const required = fallback === undefined;
		const value = parsedCall.args[i] ?? fallback;

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

	return fn.compute(paramValues);
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
				const currentStats = await stat(cachedConfig.configPath);
				if (currentStats.mtimeMs === cachedConfig.mtimeMs) {
					return cachedConfig;
				}
			} catch {
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

		let mtimeMs = 0;
		try {
			const currentStats = await stat(loaded.configPath);
			mtimeMs = currentStats.mtimeMs;
		} catch {
			// config path may be virtual (e.g. in tests); skip mtime caching
		}
		cachedConfig = {
			configPath: loaded.configPath,
			preset: loaded.preset,
			mtimeMs,
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

			// watch the config file for changes and re-run transforms when it changes
			helper.result.messages.push({
				type: 'dependency',
				plugin: PLUGIN_NAME,
				file: config.configPath,
			});

			root.walkComments((comment) => {
				if (comment.text.trim() === 'inline-arbor-base') {
					const generatedCss = generateStylesheet(config.preset);
					const generatedRoot = postcss.parse(generatedCss, {
						from: config.configPath,
					});
					comment.replaceWith(...generatedRoot.nodes);
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
				decl.value = decl.value.replace(
					fnCallRegex,
					(match) =>
						computeFunctionCallValue({
							input: match,
							config,
							node: decl,
							helper,
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

			const parsedMixinCall = parsePrefixedCall(mixinApplyCall, mixinNamePrefix);
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
			mixin.parameters.forEach((param, i) => {
				const paramName = isFunctionParamWithMeta(param) ? param.name : param;
				const fallback =
					isFunctionParamWithMeta(param) ? param.fallback?.toString() : undefined;
				const required = fallback === undefined;
				const value = mixinArgs[i] ?? fallback;

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

			const declarations = mixin.inline();
			for (const decl of declarations) {
				let value = printEquation(decl.value);
				for (const [paramName, paramValue] of Object.entries(mixinParamValues)) {
					value = value.replaceAll(`var(${paramName})`, paramValue);
				}
				atRule.cloneBefore(
					postcss.decl({ prop: decl.prop, value }),
				);
			}
			atRule.remove();
		},
	};
}

function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

ArborPlugin.postcss = true;

export const arborCss = ArborPlugin;

export default ArborPlugin;
