import { ArborPreset } from '@arbor-css/core';
import { access } from 'fs/promises';
import { createJiti } from 'jiti';
import { resolve } from 'path';

export interface LoadedConfig {
	/** Path to the resolved config file */
	configPath: string;
	/** The default export from the config (an ArborPreset) */
	preset: ArborPreset;
}

const DEFAULT_CONFIG_FILES = [
	'arbor.config.ts',
	'arbor.config.js',
	'arbor.config.mjs',
] as const;

export async function loadConfig(
	options: { cwd?: string; configFile?: string } = {},
): Promise<LoadedConfig | null> {
	const cwd = options.cwd ?? process.cwd();
	const candidates =
		options.configFile ? [options.configFile] : DEFAULT_CONFIG_FILES;

	let configPath: string | null = null;
	for (const candidate of candidates) {
		const resolvedPath = resolve(cwd, candidate);
		try {
			await access(resolvedPath);
			configPath = resolvedPath;
			break;
		} catch {
			continue;
		}
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
