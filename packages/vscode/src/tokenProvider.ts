import {
	AnyArborPreset,
	ArborFunction,
	DEFAULT_TOKEN_PREFIX,
	Token,
	flattenToPropsList,
} from '@arbor-css/core';
import { dirname } from 'path';
import * as vscode from 'vscode';
import { findConfigFile, loadConfigFile } from './configLoader.js';

/** Flat map of name->token */
export type TokenMap = Map<string, Token | ArborFunction>;
type CompletionValue = Token | ArborFunction | 'namespace';

interface ConfigState {
	configPath: string;
	preset: AnyArborPreset;
	tokenMap: TokenMap;
	tokenPrefix: string;
}

/**
 * Manages loading, caching, and watching Arbor config files per document.
 */
export class TokenProvider {
	private readonly configPathCache = new Map<string, string | null>();
	private readonly configStateCache = new Map<
		string,
		Promise<ConfigState | null>
	>();
	private readonly configWatchers = new Map<string, vscode.FileSystemWatcher>();
	private readonly workspaceWatcher: vscode.FileSystemWatcher;
	private onChangeEmitter = new vscode.EventEmitter<void>();

	constructor(private outputChannel: vscode.OutputChannel) {
		this.workspaceWatcher = vscode.workspace.createFileSystemWatcher(
			'**/arbor.config.{ts,js,mjs}',
		);
		this.workspaceWatcher.onDidCreate((uri) =>
			this.handleConfigCreatedOrDeleted(uri, 'created'),
		);
		this.workspaceWatcher.onDidDelete((uri) =>
			this.handleConfigCreatedOrDeleted(uri, 'deleted'),
		);
		this.workspaceWatcher.onDidChange((uri) =>
			this.handleConfigChanged(uri.fsPath),
		);
	}

	readonly onDidChange = this.onChangeEmitter.event;

	async primeDocument(document: vscode.TextDocument): Promise<void> {
		await this.getStateForDocument(document);
	}

	async getStateForDocument(
		document: vscode.TextDocument,
	): Promise<ConfigState | null> {
		const configPath = await this.getConfigPathForDocument(document);
		if (!configPath) {
			return null;
		}
		return await this.getConfigState(configPath);
	}

	async getTokenPrefixForDocument(
		document: vscode.TextDocument,
	): Promise<string> {
		return (
			(await this.getStateForDocument(document))?.tokenPrefix ??
			DEFAULT_TOKEN_PREFIX
		);
	}

	async getCompletions(
		document: vscode.TextDocument,
		start: string,
	): Promise<Array<{ name: string; value: CompletionValue }>> {
		const state = await this.getStateForDocument(document);
		if (!state) return [];
		return this.buildCompletions(state.tokenMap, start);
	}

	reset(): void {
		this.configPathCache.clear();
		this.configStateCache.clear();
		this.outputChannel.appendLine('Cleared Arbor config caches');
		this.onChangeEmitter.fire();
	}

	private async getConfigPathForDocument(
		document: vscode.TextDocument,
	): Promise<string | null> {
		if (document.uri.scheme !== 'file') return null;

		const fromDir = dirname(document.uri.fsPath);
		if (this.configPathCache.has(fromDir)) {
			return this.configPathCache.get(fromDir) ?? null;
		}

		const configPath = await findConfigFile(fromDir);
		this.configPathCache.set(fromDir, configPath);
		if (!configPath) {
			this.outputChannel.appendLine(
				`No arbor.config.* found searching upward from ${fromDir}`,
			);
		}
		return configPath;
	}

	private async getConfigState(
		configPath: string,
	): Promise<ConfigState | null> {
		const cached = this.configStateCache.get(configPath);
		if (cached) return await cached;

		const pending = this.loadConfigState(configPath);
		this.configStateCache.set(configPath, pending);

		const state = await pending;
		if (!state) {
			this.configStateCache.delete(configPath);
		}
		return state;
	}

	private async loadConfigState(
		configPath: string,
	): Promise<ConfigState | null> {
		const preset = await loadConfigFile(configPath);
		if (!preset) return null;

		const tokenMap = new Map<string, Token | ArborFunction>();
		for (const token of flattenToPropsList(preset)) {
			tokenMap.set(token.name, token);
		}
		for (const func of preset.functions ?
			Object.values(preset.functions)
		:	[]) {
			tokenMap.set(func.name, func);
		}

		this.ensureConfigWatcher(configPath);
		this.outputChannel.appendLine(
			`Loaded config from ${configPath} (${tokenMap.size} tokens / functions)`,
		);
		this.onChangeEmitter.fire();

		return {
			configPath,
			preset,
			tokenMap,
			tokenPrefix: preset.context.tokenPrefix,
		};
	}

	private ensureConfigWatcher(configPath: string): void {
		if (this.configWatchers.has(configPath)) return;

		const watcher = vscode.workspace.createFileSystemWatcher(configPath);
		watcher.onDidChange(() => this.handleConfigChanged(configPath));
		watcher.onDidCreate(() => this.handleConfigChanged(configPath));
		watcher.onDidDelete(() =>
			this.handleConfigCreatedOrDeleted(vscode.Uri.file(configPath), 'deleted'),
		);
		this.configWatchers.set(configPath, watcher);
	}

	private handleConfigChanged(configPath: string): void {
		if (!this.configStateCache.has(configPath)) return;
		this.configStateCache.delete(configPath);
		this.outputChannel.appendLine(`Reloading Arbor config ${configPath}`);
		this.onChangeEmitter.fire();
	}

	private handleConfigCreatedOrDeleted(
		uri: vscode.Uri,
		action: 'created' | 'deleted',
	): void {
		const configPath = uri.fsPath;
		this.configPathCache.clear();
		this.configStateCache.delete(configPath);

		if (action === 'deleted') {
			this.configWatchers.get(configPath)?.dispose();
			this.configWatchers.delete(configPath);
		}

		this.outputChannel.appendLine(
			`Arbor config ${action}: ${configPath}. Cleared nearest-config cache.`,
		);
		this.onChangeEmitter.fire();
	}

	/** Returns all next-level segments for a given prefix */
	private buildCompletions(
		tokenMap: TokenMap,
		start: string,
	): Array<{ name: string; value: CompletionValue }> {
		const results = new Map<string, CompletionValue>();
		this.outputChannel.appendLine(
			`Getting completion segments for text "${start}"`,
		);

		for (const [p, token] of tokenMap) {
			if (!p.startsWith(start)) continue;
			const rest = p.slice(start.length);
			// skip extended completion segments, focus on next items.
			// i.e. when we get --color, we want to show --color-main or --color-action,
			// not --color-main-ink etc
			// to do this, we ignore any matches where there's more than 1 - in the remainder
			const hyphenCount = (rest.match(/-/g) || []).length;
			if (hyphenCount > 1) continue;
			const partial = rest?.includes('-');

			if (partial) {
				const segment = start + rest.slice(0, rest.indexOf('-'));
				results.set(segment, 'namespace');
			} else {
				results.set(token.name, token);
			}
		}

		if (results.size === 0) {
			this.outputChannel.appendLine(`No completions found for text "${start}"`);
		} else {
			this.outputChannel.appendLine(
				`Found completions for text "${start}": ${[...results.keys()].join(', ')}`,
			);
		}

		return Array.from(results.entries()).map(([name, value]) => ({
			name,
			value,
		}));
	}

	dispose(): void {
		for (const watcher of this.configWatchers.values()) {
			watcher.dispose();
		}
		this.workspaceWatcher.dispose();
		this.onChangeEmitter.dispose();
	}
}
