import escalade from 'escalade';
import { createJiti } from 'jiti';

/** Searches upward from `fromDir` for an `arbor.config.*` file. */
export async function findConfigFile(fromDir: string): Promise<string | null> {
	const found = await escalade(fromDir, (_dir, files) => {
		if (files.includes('arbor.config.ts')) return 'arbor.config.ts';
		if (files.includes('arbor.config.js')) return 'arbor.config.js';
		if (files.includes('arbor.config.mjs')) return 'arbor.config.mjs';
	});
	return found ?? null;
}

/**
 * Loads an Arbor config file using jiti (TypeScript-aware require).
 * Returns the default export (expected to be an ArborPreset).
 */
export async function loadConfigFile(configPath: string): Promise<any | null> {
	try {
		const jiti = createJiti(import.meta.url, {
			moduleCache: false,
			fsCache: false,
		});
		const mod = await jiti.import(configPath);
		return (mod as any).default ?? mod;
	} catch (err) {
		console.error(`[arbor-css] Failed to load config at ${configPath}:`, err);
		return null;
	}
}
