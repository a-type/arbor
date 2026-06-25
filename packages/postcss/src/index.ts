import { AnyArborPreset, generateStylesheet } from '@arbor-css/core';
import { printCss } from '@arbor-css/css-eval';
import { isFunction, isMixin } from '@arbor-css/functions';
import { replaceCssFunctionCall } from '@arbor-css/util';
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
				if (
					comment.text.trim() === 'inline-arbor-base' ||
					comment.text.trim() === "@import('arbor:css')" ||
					comment.text.trim() === '@import("arbor:css")'
				) {
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
			while (decl.value.includes(functionNamePrefix)) {
				const original = decl.value;
				let failed = false;
				decl.value = replaceCssFunctionCall(
					decl.value,
					functionNamePrefix,
					(name, args) => {
						const fn = Object.values(config.preset.functions ?? {}).find(
							(f) => isFunction(f) && f.name === name,
						);

						if (!fn) {
							helper.result.warn(`[arbor-css] Unknown function: ${name}`, {
								plugin: PLUGIN_NAME,
								node: decl,
							});
							failed = true;
							return `${name}(${args.join(', ')})`;
						}

						try {
							const inputs = fn.constructParamInputs(args);
							return fn.compute(inputs).text;
						} catch (err) {
							const message = err instanceof Error ? err.message : String(err);
							console.error(
								`[arbor-css] Error computing function "${name}": ${message}`,
							);
							helper.result.warn(
								`[arbor-css] Error computing function "${name}" — value left unchanged. ${message}`,
								{ plugin: PLUGIN_NAME, node: decl },
							);
							failed = true;
							return `${name}(${args.join(', ')})`;
						}
					},
				);

				if (failed) {
					// FIXME: obviously break is a sign of bad control flow here...
					// this is too close to infinite loop land
					break;
				}

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

			const replaced = replaceCssFunctionCall(
				mixinApplyCall,
				mixinNamePrefix,
				(name, args) => {
					const mixin = Object.values(config.preset.mixins ?? {}).find(
						(m) => isMixin(m) && m.name === name,
					);

					if (!mixin) {
						helper.result.warn(`[arbor-css] Unknown mixin: ${name}`, {
							plugin: PLUGIN_NAME,
							node: atRule,
						});
						return `${name}(${args.join(', ')})`;
					}

					try {
						const inputs = mixin.constructParamInputs(args);
						const applied = mixin.apply(inputs);
						const printed = printCss(applied);
						return printed;
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err);
						console.error(
							`[arbor-css] Error applying mixin "${name}": ${message}`,
						);
						helper.result.warn(
							`[arbor-css] Error applying mixin "${name}" — @apply left in place. ${message}`,
							{ plugin: PLUGIN_NAME, node: atRule },
						);
						return `${name}(${args.join(', ')})`;
					}
				},
			);

			// add comment telling the user which mixin this was from
			atRule.before(
				postcss.comment({
					text: `begin: ${mixinApplyCall}`,
				}),
			);

			try {
				const generatedRoot = postcss.parse(replaced, {
					from: config.configPath,
				});
				atRule.replaceWith(
					...generatedRoot.nodes,
					postcss.comment({ text: `end: ${mixinApplyCall}` }),
				);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				console.error(
					`[arbor-css] Error applying mixin "${mixinApplyCall}": ${message}`,
				);
				helper.result.warn(
					`[arbor-css] Error applying mixin "${mixinApplyCall}" — @apply left in place. ${message}`,
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

ArborPlugin.postcss = true;

export const arborCss = ArborPlugin;

export default ArborPlugin;
