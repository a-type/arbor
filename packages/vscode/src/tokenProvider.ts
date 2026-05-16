import { getStructuredTokensMap, Token } from '@arbor-css/core';
import * as vscode from 'vscode';
import { findConfigFile, loadConfigFile } from './configLoader.js';

/** Flat map from dot-path to token entry */
export type TokenMap = Map<string, Token>;

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
		this.tokenMap = getStructuredTokensMap(preset, { delimiter: '.' });
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
