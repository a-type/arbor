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
					(match, fnName, argsStr) => {
						const fn = Object.values(config.preset.functions ?? {}).find(
							(f) => isFunction(f) && f.name === fnName,
						);

						if (!fn) {
							helper.result.warn(`[arbor-css] Unknown function: ${fnName}`, {
								plugin: PLUGIN_NAME,
								node: decl,
							});
							return match;
						}

						const args = argsStr
							.split(',')
							.map((a: string) => a.trim())
							.filter(Boolean);

						const paramValues: Record<string, string> = {};
						let invalid = false;
						fn.parameters.forEach((param, i) => {
							const paramName =
								isFunctionParamWithMeta(param) ? param.name : param;

							const required =
								!isFunctionParamWithMeta(param) || param.fallback === undefined;
							if (i >= args.length && required) {
								invalid = true;
								helper.result.warn(
									`[arbor-css] Missing argument for parameter "${paramName}" in function call: ${match}`,
									{
										plugin: PLUGIN_NAME,
										node: decl,
									},
								);
								return;
							}

							paramValues[paramName] = args[i] ?? '';
						});

						console.log(
							`[arbor-css] Inlining function call: ${match} with values`,
							paramValues,
						);

						if (invalid) {
							return '/* Invalid function call */';
						}

						return fn.compute(paramValues);
					},
				);
			}

		},
		async AtRule(atRule, helper) {
			if (atRule.name !== 'apply') return;
			const config = await getConfig(helper);
			if (!config) return;

			const mixinName = atRule.params.trim();
			const mixinNamePrefix =
				config.preset.context.tokenPrefixes.mixinNamePrefix;
			if (!mixinName.startsWith(mixinNamePrefix)) return;

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

			const declarations = mixin.inline();
			for (const decl of declarations) {
				atRule.cloneBefore(
					postcss.decl({ prop: decl.prop, value: printEquation(decl.value) }),
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
