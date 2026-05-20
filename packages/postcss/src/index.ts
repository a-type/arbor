import { printEquation } from '@arbor-css/calc';
import { AnyArborPreset, generateStylesheet } from '@arbor-css/core';
import { isFunction, isMixin } from '@arbor-css/functions';
import { stat } from 'node:fs/promises';
import postcss, { Plugin } from 'postcss';
import { getColorPropEntries } from './colorSystemProps.js';
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
					const generatedRoot = postcss.parse(generatedCss);
					comment.replaceWith(...generatedRoot.nodes);
				}
			});
		},

		async Declaration(decl, helper) {
			const config = await getConfig(helper);
			if (!config) {
				return;
			}

			// Inline custom function calls: --x-fn-name(arg1, arg2, ...)
			if (decl.value.includes(`${config.preset.context.tokenPrefix}fn-`)) {
				const fnCallRegex = new RegExp(
					`(${escapeRegExp(`${config.preset.context.tokenPrefix}fn-`)}[\\w-]+)\\(([^)]*)\\)`,
					'g',
				);
				decl.value = decl.value.replace(
					fnCallRegex,
					(match, fnName, argsStr) => {
						const fn = Object.values(config.preset.functions ?? {}).find(
							(f) => isFunction(f) && f.name === fnName,
						) as
							| import('../../functions/dist/functions.js').ArborFunction
							| undefined;

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
						fn.parameters.forEach((param, i) => {
							const paramName =
								typeof param === 'string' ?
									param.replace(/^--/, '')
								:	((param as any).name?.replace(/^--/, '') ?? String(i));
							paramValues[paramName] = args[i] ?? '';
						});

						return fn.compute(paramValues);
					},
				);
			}

			const colorPropEntries = getColorPropEntries(config.preset);

			const systemAssignmentEntry = colorPropEntries[decl.prop];
			if (systemAssignmentEntry) {
				// Inject system color props before this declaration
				decl.cloneBefore({
					prop: systemAssignmentEntry.applied,
					value: decl.value,
					raws: {},
				});
				decl.cloneBefore({
					prop: systemAssignmentEntry.final,
					value: `var(${systemAssignmentEntry.applied})`,
					raws: {},
				});
				decl.cloneBefore({
					prop: systemAssignmentEntry.opacity,
					value: '1',
					raws: {},
				});
				for (const extra of systemAssignmentEntry.extras ?? []) {
					decl.cloneBefore({
						prop: extra.prop,
						value:
							extra.value === 'applied' ?
								`var(${systemAssignmentEntry.applied})`
							:	extra.value,
						raws: {},
					});
				}
				// Point the actual CSS property at the system final var for runtime flexibility
				decl.value = `var(${systemAssignmentEntry.final})`;
			}
		},
		async AtRule(atRule, helper) {
			if (atRule.name !== 'apply') return;
			const config = await getConfig(helper);
			if (!config) return;

			const mixinName = atRule.params.trim();
			if (!mixinName.startsWith(`${config.preset.context.tokenPrefix}mixin-`))
				return;

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
