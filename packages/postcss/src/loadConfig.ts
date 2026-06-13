import { AnyArborPreset } from '@arbor-css/core';
import {
	findConfigInDir,
	loadConfigWithDeps,
	type LoadedConfigWithDeps,
} from '@arbor-css/util/config-loader';
import { createJiti } from 'jiti';

export type { LoadedConfigWithDeps };

export interface LoadedConfig {
	/** Path to the resolved config entry-point file. */
	configPath: string;
	/** The default export from the config (an ArborPreset). */
	preset: AnyArborPreset;
	/**
	 * All local (non-node_modules) files transitively imported during config
	 * load, including the config file itself.  Tell the host bundler / build
	 * tool to watch all of these so that changes to any imported module trigger
	 * a re-run of the plugin.
	 */
	dependencies: string[];
}

export async function loadConfig(
	options: { cwd?: string; configFile?: string } = {},
): Promise<LoadedConfig | null> {
	const cwd = options.cwd ?? process.cwd();

	let configPath: string | null = null;
	if (options.configFile) {
		const { resolve } = await import('node:path');
		const { access } = await import('node:fs/promises');
		const resolved = resolve(cwd, options.configFile);
		try {
			await access(resolved);
			configPath = resolved;
		} catch {
			return null;
		}
	} else {
		configPath = await findConfigInDir(cwd);
	}

	if (!configPath) return null;

	const jiti = createJiti(import.meta.url);

	const result = await loadConfigWithDeps<AnyArborPreset>(configPath, jiti);
	if (!result) return null;

	return {
		configPath: result.configPath,
		preset: result.preset,
		dependencies: result.dependencies,
	};
}
