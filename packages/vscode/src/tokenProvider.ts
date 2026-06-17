import {
	AnyArborPreset,
	ArborFunction,
	ArborMixin,
	css,
	DEFAULT_MODE_TOKEN_PREFIX,
	flattenAndApplyTokenValues,
	flattenTokenSchema,
	Token,
} from '@arbor-css/core';
import { dirname } from 'path';
import * as vscode from 'vscode';
import { findConfigFile, loadConfigFile } from './configLoader.js';
import { getTokenCompletions } from './tokenCompletions.js';

/** Flat map of name->token */
export type TokenMap = Map<
	string,
	Token | ArborFunction | ArborMixin<any, any>
>;
export type CompletionValue =
	| Token
	| ArborFunction
	| ArborMixin<any, any>
	| 'namespace';

export interface ConfigState {
	configPath: string;
	preset: AnyArborPreset;
	tokenMap: TokenMap;
	tokenPrefixes: string[];
	tokenDefinitions: Record<string, string>;
	/** All local files transitively imported by this config (incl. the config itself). */
	dependencies: string[];
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
	/**
	 * File watchers keyed by *watched path* (a dependency file).
	 * Each entry maps to the config entry-point path it belongs to so we know
	 * which cached state to evict when the file changes.
	 */
	private readonly depWatchers = new Map<
		string,
		{ watcher: vscode.FileSystemWatcher; configPath: string }
	>();
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

	async getTokenPrefixesForDocument(
		document: vscode.TextDocument,
	): Promise<string[]> {
		return (
			(await this.getStateForDocument(document))?.tokenPrefixes ?? [
				DEFAULT_MODE_TOKEN_PREFIX,
			]
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

	/**
	 * Resolves the filesystem path to use when searching upward for an
	 * arbor.config.* file.  For ordinary files this is the document's own
	 * directory.  For virtual "embedded-content" documents produced by VS Code
	 * when a <style> block is processed inside an .astro / .svelte / .vue /
	 * .html file we fall back to the currently-active editor's file path so
	 * that the config search still anchors to the real project directory.
	 */
	private resolveDocumentDir(document: vscode.TextDocument): string | null {
		if (document.uri.scheme === 'file') {
			return dirname(document.uri.fsPath);
		}
		// Virtual embedded-content documents — use the active editor's real file.
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && activeEditor.document.uri.scheme === 'file') {
			return dirname(activeEditor.document.uri.fsPath);
		}
		return null;
	}

	private async getConfigPathForDocument(
		document: vscode.TextDocument,
	): Promise<string | null> {
		const fromDir = this.resolveDocumentDir(document);
		if (!fromDir) return null;
		if (this.configPathCache.has(fromDir)) {
			return this.configPathCache.get(fromDir) ?? null;
		}

		this.outputChannel.appendLine(
			`Searching for config path for document ${document.uri.fsPath}...`,
		);
		const configPath = await findConfigFile(fromDir);
		this.configPathCache.set(fromDir, configPath);
		if (!configPath) {
			this.outputChannel.appendLine(
				`No arbor.config.* found searching upward from ${fromDir}`,
			);
		} else {
			this.outputChannel.appendLine(
				`Found config for ${fromDir}: ${configPath}`,
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
		try {
			const loaded = await loadConfigFile(configPath);
			if (!loaded || !loaded.preset || !('$' in loaded.preset)) {
				this.outputChannel.appendLine(
					`Failed to load config from ${configPath}: did not return valid config`,
				);
				this.outputChannel.appendLine(
					`Loaded config content: ${JSON.stringify(loaded?.preset)}`,
				);
				return null;
			}

			const { preset, dependencies } = loaded;

			const tokenMap = new Map<
				string,
				Token | ArborFunction | ArborMixin<any, any>
			>();
			for (const token of flattenTokenSchema(preset.$)) {
				tokenMap.set(token.name, token);
			}
			for (const func of preset.functions ?
				Object.values(preset.functions)
			:	[]) {
				tokenMap.set(func.name, func);
			}
			for (const mixin of preset.mixins ? Object.values(preset.mixins) : []) {
				tokenMap.set(mixin.name, mixin);
			}

			// Register watchers for every dependency (incl. the config file itself)
			this.syncDepWatchers(configPath, dependencies);

			this.outputChannel.appendLine(
				`Loaded config from ${configPath} (${tokenMap.size} tokens / functions, ${dependencies.length} dependencies)`,
			);
			this.outputChannel.appendLine(
				`Watching dependencies:\n${dependencies.map((d) => `  ${d}`).join('\n')}`,
			);
			this.onChangeEmitter.fire();
			const configuredPrefixes = Object.values(
				preset.context.tokenPrefixes,
			).filter((value): value is string => typeof value === 'string');
			const tokenPrefixes = [...new Set(configuredPrefixes)];
			if (tokenPrefixes.length === 0) {
				tokenPrefixes.push(DEFAULT_MODE_TOKEN_PREFIX);
			}

			const tokenDefinitionsRaw = flattenAndApplyTokenValues(
				preset.$,
				{ mode: preset.baseMode, system: {}, mixins: {} },
				{ allowMissing: true },
			);
			const tokenDefinitions = Object.fromEntries(
				Object.entries(tokenDefinitionsRaw).map(([key, value]) => [
					key,
					css`
						${value}
					`.text,
				]),
			);

			return {
				configPath,
				preset,
				tokenMap,
				tokenPrefixes,
				dependencies,
				tokenDefinitions,
			};
		} catch (err) {
			this.outputChannel.appendLine(
				`Error loading config from ${configPath}: ${err}`,
			);
			this.outputChannel.appendLine(
				err instanceof Error ? (err.stack ?? '<no stack trace>') : String(err),
			);
			return null;
		}
	}

	/**
	 * Reconcile the per-dependency file watchers for a given config entry-point.
	 * Adds watchers for new deps, removes watchers for deps no longer present.
	 */
	private syncDepWatchers(configPath: string, dependencies: string[]): void {
		const newDepSet = new Set(dependencies);

		// Remove stale watchers that belong to this config but are no longer deps
		for (const [depPath, entry] of this.depWatchers) {
			if (entry.configPath === configPath && !newDepSet.has(depPath)) {
				entry.watcher.dispose();
				this.depWatchers.delete(depPath);
			}
		}

		// Add watchers for new deps
		for (const depPath of dependencies) {
			if (this.depWatchers.has(depPath)) continue;

			const watcher = vscode.workspace.createFileSystemWatcher(depPath);
			watcher.onDidChange(() => this.handleConfigChanged(configPath));
			watcher.onDidCreate(() => this.handleConfigChanged(configPath));
			watcher.onDidDelete(() =>
				this.handleConfigCreatedOrDeleted(
					vscode.Uri.file(configPath),
					'deleted',
				),
			);
			this.depWatchers.set(depPath, { watcher, configPath });
		}
	}

	private handleConfigChanged(configPath: string): void {
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
			// Dispose all dependency watchers that belong to this config
			for (const [depPath, entry] of this.depWatchers) {
				if (entry.configPath === configPath) {
					entry.watcher.dispose();
					this.depWatchers.delete(depPath);
				}
			}
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
		this.outputChannel.appendLine(
			`Getting completion segments for text "${start}"`,
		);

		const results = getTokenCompletions(tokenMap, start);
		if (results.length === 0) {
			this.outputChannel.appendLine(`No completions found for text "${start}"`);
		} else {
			this.outputChannel.appendLine(
				`Found completions for text "${start}": ${[...results].map((r) => r.name).join(', ')}`,
			);
		}

		return results;
	}

	dispose(): void {
		for (const { watcher } of this.depWatchers.values()) {
			watcher.dispose();
		}
		this.workspaceWatcher.dispose();
		this.onChangeEmitter.dispose();
	}
}
