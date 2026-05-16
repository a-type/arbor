import escalade from 'escalade';
import { createJiti } from 'jiti';
import { resolve } from 'path';

export interface LoadedConfig {
	/** Path to the resolved config file */
	configPath: string;
	/** The default export from the config (an ArborPreset) */
	preset: any;
}

/**
 * Finds and loads an `arbor.config.ts` (or .js) file by searching upward
 * from the given directory.
 */
export async function loadConfig(
	fromDir: string,
	options: { configFile?: string } = {},
): Promise<LoadedConfig | null> {
	let configPath: string | null = null;

	if (options.configFile) {
		configPath = resolve(fromDir, options.configFile);
	} else {
		const found = await escalade(fromDir, (_dir, files) => {
			if (files.includes('arbor.config.ts')) return 'arbor.config.ts';
			if (files.includes('arbor.config.js')) return 'arbor.config.js';
			if (files.includes('arbor.config.mjs')) return 'arbor.config.mjs';
		});
		configPath = found ?? null;
	}

	if (!configPath) return null;

	const jiti = createJiti(import.meta.url, {
		moduleCache: false,
		fsCache: false,
	});

	const mod = await jiti.import(configPath);
	const preset = (mod as any).default ?? mod;

	return { configPath, preset };
}
