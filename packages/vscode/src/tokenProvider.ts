import {
	AnyArborPreset,
	ArborFunction,
	TOKEN_PREFIX,
	Token,
	flattenToPropsList,
} from '@arbor-css/core';
import * as vscode from 'vscode';
import { findConfigFile, loadConfigFile } from './configLoader.js';

/** Flat map of name->token */
export type TokenMap = Map<string, Token | ArborFunction>;

/**
 * Manages loading, caching, and watching of the user's Arbor config file.
 * Provides a flat token map and hierarchical tree for completions.
 */
export class TokenProvider {
	private tokenMap: TokenMap = new Map();
	private preset: AnyArborPreset | null = null;
	private tokenPrefix = TOKEN_PREFIX;
	private configPath: string | null = null;
	private watcher: vscode.FileSystemWatcher | null = null;
	private onChangeEmitter = new vscode.EventEmitter<void>();

	constructor(private outputChannel: vscode.OutputChannel) {}

	readonly onDidChange = this.onChangeEmitter.event;

	async initialize(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
		const configPath = await findConfigFile(workspaceFolder.uri.fsPath);
		if (!configPath) {
			this.outputChannel.appendLine('No arbor.config.ts found in workspace');
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
		this.tokenPrefix = preset.meta?.tokenPrefix ?? TOKEN_PREFIX;
		const tokensList = flattenToPropsList(preset);
		this.tokenMap = new Map();
		for (const token of tokensList) {
			this.tokenMap.set(token.name, token);
		}
		for (const func of preset.functions ?
			Object.values(preset.functions)
		:	[]) {
			this.tokenMap.set(func.name, func);
		}
		this.outputChannel.appendLine(
			`Loaded config from ${this.configPath} (${this.tokenMap.size} tokens / functions)`,
		);
		this.outputChannel.appendLine(
			`Example token: ${[...this.tokenMap.entries()][0]}`,
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

	getPreset(): AnyArborPreset | null {
		return this.preset;
	}

	getTokenPrefix(): string {
		return this.tokenPrefix;
	}

	/** Returns all next-level segments for a given prefix */
	getCompletions(
		start: string,
	): Array<{ name: string; value: Token | ArborFunction | 'namespace' }> {
		const results = new Map<string, Token | ArborFunction | 'namespace'>();
		this.outputChannel.appendLine(
			`Getting completion segments for text "${start}"`,
		);

		for (const [p, token] of this.tokenMap) {
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
				results.set(token.name, this.tokenMap.get(p)!);
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
		this.watcher?.dispose();
		this.onChangeEmitter.dispose();
	}
}
