import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The filenames Arbor recognises as config entry points, in search priority order.
 */
export const CONFIG_FILE_NAMES = [
	'arbor.config.ts',
	'arbor.config.js',
	'arbor.config.mjs',
] as const;

export type ConfigFileName = (typeof CONFIG_FILE_NAMES)[number];

/**
 * A minimal subset of the jiti `Jiti` interface that `loadConfigWithDeps`
 * requires. Typed this way so that callers can pass either
 * `createJiti(…)` or `createJiti` from `'jiti/static'` — both satisfy it.
 */
export interface JitiLike {
	/** The module cache populated by jiti during require/import calls. */
	cache: Record<string, unknown>;
	import<T = unknown>(id: string, opts?: unknown): Promise<T>;
}

/**
 * The result of a successful config load.
 */
export interface LoadedConfigWithDeps<TPreset> {
	/** Absolute path to the config entry-point file. */
	configPath: string;
	/** The default export from the config file (expected to be an ArborPreset). */
	preset: TPreset;
	/**
	 * All local (non-node_modules) files that were transitively imported while
	 * loading the config, including the config file itself.
	 * Use this list to set up file-watchers or PostCSS dependency messages so
	 * that changes to any imported module trigger a reload.
	 */
	dependencies: string[];
}

/**
 * Convert a `file://…` URL or an absolute path to a normalised absolute
 * filesystem path.  Returns `null` for non-filesystem identifiers (e.g. bare
 * module specifiers, data: URLs).
 */
function toFsPath(id: string): string | null {
	try {
		if (id.startsWith('file://')) {
			return fileURLToPath(id);
		}
		// jiti also stores plain paths in some environments.
		// it seems that it also uses forward slashes in Windows...
		// stuff like '/home/user/...' and 'c:/users/...' shows up.
		if (id.startsWith('/') || /^[A-Za-z]:[\\/]/.test(id)) {
			return id;
		}
	} catch {
		// ignore malformed URLs
	}
	return null;
}

/**
 * Returns true for paths that live inside a `node_modules` directory.
 * We only want to watch first-party source files.
 */
function isNodeModule(fsPath: string): boolean {
	return fsPath.includes('node_modules');
}

/**
 * Load an Arbor config file via a provided jiti instance and collect every
 * local module that was transitively imported during the load.
 *
 * @param configPath - Absolute path to the config entry-point.
 * @param jiti       - A pre-created jiti instance (caller supplies the
 *                     appropriate variant: `jiti` or `jiti/static`).
 *
 * @returns The loaded preset and the full dependency set, or `null` if loading fails.
 */
export async function loadConfigWithDeps<TPreset = unknown>(
	configPath: string,
	jiti: JitiLike,
): Promise<LoadedConfigWithDeps<TPreset> | null> {
	// Snapshot the keys already in jiti's cache so we can diff afterwards.
	// We need moduleCache *enabled* during the load so that jiti populates
	// cache as it resolves transitive imports — that's how we discover deps.
	const cacheKeysBefore = new Set(Object.keys(jiti.cache));

	try {
		const mod = await jiti.import<{ default?: TPreset } | TPreset>(configPath);
		const preset = ((mod as any)?.default ?? mod) as TPreset;

		// Collect all cache keys that appeared during this load, then immediately
		// evict them so the next reload re-evaluates every module from scratch
		// (equivalent to moduleCache: false, but compatible with dep tracking).
		const newKeys = Object.keys(jiti.cache).filter(
			(k) => !cacheKeysBefore.has(k),
		);
		for (const key of newKeys) {
			delete jiti.cache[key];
		}

		const dependencies: string[] = [];
		for (const key of newKeys) {
			const fsPath = toFsPath(key);
			if (!fsPath) continue;
			if (isNodeModule(fsPath)) continue;
			dependencies.push(fsPath);
		}

		// Always include the entry point itself — jiti may not cache it under the
		// exact same string we passed (e.g. file:// URL vs plain path).
		if (!dependencies.includes(configPath)) {
			dependencies.unshift(configPath);
		}

		return { configPath, preset, dependencies };
	} catch (error) {
		console.error(`Failed to load config at ${configPath}:`, error);
		return null;
	}
}

/**
 * Search *only* inside `dir` (no upward traversal) for an Arbor config file.
 * Returns the absolute path to the first match, or `null` if none is found.
 *
 * Used by the PostCSS plugin which is anchored to the build's `cwd`.
 */
export async function findConfigInDir(dir: string): Promise<string | null> {
	for (const candidate of CONFIG_FILE_NAMES) {
		const resolvedPath = resolve(dir, candidate);
		try {
			await access(resolvedPath);
			return resolvedPath;
		} catch {
			continue;
		}
	}
	return null;
}
