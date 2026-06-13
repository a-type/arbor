import { AnyArborPreset } from '@arbor-css/core';
import {
	CONFIG_FILE_NAMES,
	loadConfigWithDeps,
	type LoadedConfigWithDeps,
} from '@arbor-css/util/config-loader';
import escalade from 'escalade';
import { createJiti } from 'jiti/static';
import { pathToFileURL } from 'node:url';

export { CONFIG_FILE_NAMES };
export type { LoadedConfigWithDeps };

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
 * Loads an Arbor config file, returning the preset and the full set of local
 * files that were transitively imported.  Pass the returned `dependencies`
 * array to `TokenProvider` so it can watch all of them for changes.
 */
export async function loadConfigFile(
	configPath: string,
): Promise<LoadedConfigWithDeps<AnyArborPreset> | null> {
	// Use a file:// URL — jiti/static resolves imports relative to it
	const configUrl = pathToFileURL(configPath).href;

	const jiti = createJiti(import.meta.url, {
		importMeta: import.meta,
	});

	const result = await loadConfigWithDeps<AnyArborPreset>(configUrl, jiti);
	if (!result) return null;

	// loadConfigWithDeps records the configUrl in dependencies; replace it with
	// the plain filesystem path so callers receive consistent absolute paths.
	const dependencies = result.dependencies.map((dep) =>
		dep === configUrl ? configPath : dep,
	);

	return {
		configPath,
		preset: result.preset,
		dependencies,
	};
}
