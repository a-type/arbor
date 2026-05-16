import * as vscode from 'vscode';
import { findConfigFile, loadConfigFile } from './configLoader.js';

export interface TokenEntry {
	/** e.g. `var(--Ⓜ️-color-main-mid)` */
	cssVar: string;
	/** e.g. `--Ⓜ️-color-main-mid` */
	name: string;
	/** Token purpose for type info and color detection */
	purpose: string;
}

/** Flat map from dot-path to token entry */
export type TokenMap = Map<string, TokenEntry>;

/**
 * Manages loading, caching, and watching of the user's Arbor config file.
 * Provides a flat token map and hierarchical tree for completions.
 */
export class TokenProvider {
	private tokenMap: TokenMap = new Map();
	private preset: any = null;
	private configPath: string | null = null;
	private watcher: vscode.FileSystemWatcher | null = null;
	private onChangeEmitter = new vscode.EventEmitter<void>();

	readonly onDidChange = this.onChangeEmitter.event;

	async initialize(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
		const configPath = await findConfigFile(workspaceFolder.uri.fsPath);
		if (!configPath) {
			console.log('[arbor-css] No arbor.config.ts found in workspace');
			return;
		}

		this.configPath = configPath;
		await this.reload();
		this.startWatching();
	}

	private async reload(): Promise<void> {
		if (!this.configPath) return;

		const preset = await loadConfigFile(this.configPath);
		if (!preset) return;

		this.preset = preset;
		this.tokenMap = buildTokenMap(preset);
		console.log(
			`[arbor-css] Loaded config from ${this.configPath} (${this.tokenMap.size} tokens)`,
		);
		this.onChangeEmitter.fire();
	}

	private startWatching(): void {
		if (!this.configPath) return;

		const watcher = vscode.workspace.createFileSystemWatcher(this.configPath);
		watcher.onDidChange(() => this.reload());
		watcher.onDidCreate(() => this.reload());
		this.watcher = watcher;
	}

	getTokenMap(): TokenMap {
		return this.tokenMap;
	}

	getPreset(): any {
		return this.preset;
	}

	/** Returns all next-level segments for a given dot-path prefix */
	getCompletionSegments(
		prefix: string,
	): Array<{ segment: string; isLeaf: boolean }> {
		const results = new Map<string, boolean>();
		const searchPrefix = prefix ? prefix + '.' : '';

		for (const [p] of this.tokenMap) {
			if (!p.startsWith(searchPrefix)) continue;
			const rest = p.slice(searchPrefix.length);
			const nextSegment = rest.split('.')[0];
			if (!nextSegment) continue;

			const isLeaf = rest === nextSegment; // no more dots = it's a leaf
			if (!results.has(nextSegment) || isLeaf) {
				results.set(nextSegment, isLeaf);
			}
		}

		return Array.from(results.entries()).map(([segment, isLeaf]) => ({
			segment,
			isLeaf,
		}));
	}

	dispose(): void {
		this.watcher?.dispose();
		this.onChangeEmitter.dispose();
	}
}

function buildTokenMap(preset: any): TokenMap {
	const map: TokenMap = new Map();

	const modeTokens = preset?.modes?.base?.schema?.$tokens;
	if (modeTokens) walkTokenTree(modeTokens, '', map);

	const primitiveTokens = preset?.primitives?.$tokens;
	if (primitiveTokens) walkTokenTree(primitiveTokens, 'primitives', map);

	return map;
}

function isToken(value: any): boolean {
	return typeof value === 'object' && value !== null && '@@TOKEN@@' in value;
}

function walkTokenTree(node: any, prefix: string, map: TokenMap): void {
	if (typeof node !== 'object' || node === null) return;
	for (const key of Object.keys(node)) {
		const value = node[key];
		const currentPath = prefix ? `${prefix}.${key}` : key;
		if (isToken(value)) {
			const entry: TokenEntry = {
				cssVar: value.var ?? '',
				name: value.name ?? '',
				purpose: value.purpose ?? 'other',
			};
			map.set(currentPath, entry);
			if (key === '$root' && prefix) map.set(prefix, entry);
		} else if (typeof value === 'object' && value !== null) {
			walkTokenTree(value, currentPath, map);
		}
	}
}
