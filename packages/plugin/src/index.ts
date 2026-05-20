import { getStructuredTokensMap } from '@arbor-css/core';
import { Token } from '@arbor-css/tokens';
import { createUnplugin } from 'unplugin';
import { loadConfig } from './loadConfig.js';
import { transform } from './transform.js';

export interface ArborPluginOptions {
	/**
	 * Path to the Arbor config file.
	 * If not provided, the plugin will look in the current working directory.
	 */
	configFile?: string;
}

const ANY_CSS_RE = /\.css(\?.*)?$/;

interface CachedConfig {
	tokenMap: Map<string, Token>;
	preset: any;
}

export const ArborPlugin = createUnplugin(
	(options: ArborPluginOptions = {}) => {
		const { configFile } = options;
		const cwd = process.cwd();

		// Cache per config-file path
		const configCache = new Map<string, CachedConfig>();

		async function getConfig(): Promise<CachedConfig | null> {
			const loaded = await loadConfig({ cwd, configFile });
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
				const config = await getConfig();

				if (!config) {
					this.warn(
						`[arbor-css] No arbor.config file found in ${cwd}. Token references will not be resolved.`,
					);
					return null;
				}

				const result = transform(code, config.preset);

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
