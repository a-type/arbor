import { getStructuredTokensMap } from '@arbor-css/core';
import { Token } from '@arbor-css/tokens';
import { dirname } from 'path';
import { createUnplugin } from 'unplugin';
import { loadConfig } from './loadConfig.js';
import { transform } from './transform.js';

export interface ArborPluginOptions {
	/**
	 * Path to the Arbor config file.
	 * If not provided, the plugin will search upward from each transformed file.
	 */
	configFile?: string;
	/**
	 * If true, warnings about unknown token references are emitted as build warnings.
	 * @default true
	 */
	warnOnMissingTokens?: boolean;
}

const ARBOR_CSS_RE = /\.arbor\.css(\?.*)?$/;
const ANY_CSS_RE = /\.css(\?.*)?$/;

interface CachedConfig {
	tokenMap: Map<string, Token>;
	preset: any;
}

export const ArborPlugin = createUnplugin(
	(options: ArborPluginOptions = {}) => {
		const { configFile, warnOnMissingTokens = true } = options;

		// Cache per config-file path
		const configCache = new Map<string, CachedConfig>();

		async function getConfig(fromDir: string): Promise<CachedConfig | null> {
			const loaded = await loadConfig(fromDir, { configFile });
			if (!loaded) return null;

			const cached = configCache.get(loaded.configPath);
			if (cached) return cached;

			const tokenMap = getStructuredTokensMap(loaded.preset, {
				delimiter: '.',
			});
			const entry: CachedConfig = { tokenMap, preset: loaded.preset };
			configCache.set(loaded.configPath, entry);
			console.log(
				`[arbor-css] Loaded config from ${loaded.configPath} (${tokenMap.size} tokens)`,
			);
			return entry;
		}

		return {
			name: 'arbor-css',
			enforce: 'pre',

			transformInclude(id) {
				return ANY_CSS_RE.test(id);
			},

			async transform(code, id) {
				const isArborCss = ARBOR_CSS_RE.test(id);
				const hasArborImport =
					code.includes("'arbor:css'") || code.includes('"arbor:css"');

				// Skip plain CSS files that don't use any Arbor features
				if (!isArborCss && !hasArborImport) return null;

				const fileDir = dirname(id.replace(/\?.*$/, ''));
				const config = await getConfig(fileDir);

				if (!config) {
					this.warn(
						`[arbor-css] No arbor.config.ts found searching upward from ${fileDir}. Token references will not be resolved.`,
					);
					return null;
				}

				const result = transform(
					code,
					isArborCss ? config.tokenMap : null,
					hasArborImport ? config.preset : null,
				);

				if (warnOnMissingTokens) {
					for (const warning of result.warnings) {
						this.warn(`[arbor-css] ${warning}`);
					}
				}

				return {
					code: result.css,
					map: null,
				};
			},

			watchChange(id) {
				// Invalidate cache when config files change
				if (id.includes('arbor.config')) {
					console.log(
						`[arbor-css] Config changed (${id}), clearing token cache`,
					);
					configCache.clear();
				}
			},
		};
	},
);

export default ArborPlugin;
