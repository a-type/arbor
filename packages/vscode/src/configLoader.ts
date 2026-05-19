import { AnyArborPreset } from '@arbor-css/core';
import escalade from 'escalade';
import { pathToFileURL } from 'node:url';

export const CONFIG_FILE_NAMES = [
	'arbor.config.ts',
	'arbor.config.js',
	'arbor.config.mjs',
] as const;

/** Searches upward from `fromDir` for an `arbor.config.*` file. */
export async function findConfigFile(fromDir: string): Promise<string | null> {
	const found = await escalade(fromDir, (_dir, files) => {
		for (const fileName of CONFIG_FILE_NAMES) {
			if (files.includes(fileName)) return fileName;
		}
	});
	return found ?? null;
}

/**
 * Loads an Arbor config file using jiti (TypeScript-aware require).
 * Returns the default export (expected to be an ArborPreset).
 */
export async function loadConfigFile(
	configPath: string,
): Promise<AnyArborPreset | null> {
	try {
		const specifier = pathToFileURL(configPath).href;
		const mod = await import(specifier);
		return (mod as any).default ?? mod;
	} catch (err) {
		console.error(`[arbor-css] Failed to load config at ${configPath}:`, err);
		return null;
	}
}
