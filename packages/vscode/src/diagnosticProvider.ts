import { isFunction, isMixin } from '@arbor-css/core';
import * as vscode from 'vscode';
import { findArbitraryValueWarnings } from './arbitraryValueDiagnostics.js';
import { createTokenRegexes } from './regex.js';
import { TokenProvider } from './tokenProvider.js';

// Pure CSS-family languages handled directly.
const supportedLanguages = [
	'css',
	'scss',
	'less',
	// Host language IDs for files that embed CSS in <style> blocks.
	'astro',
	'svelte',
	'vue',
	'html',
];

/**
 * Manages diagnostics (red underlines) for unknown Arbor token references.
 */
export class ArborDiagnosticProvider {
	private readonly diagnostics: vscode.DiagnosticCollection;

	constructor(private readonly tokenProvider: TokenProvider) {
		this.diagnostics = vscode.languages.createDiagnosticCollection('arbor-css');
	}

	/** Registers document event listeners and returns disposables. */
	register(context: vscode.ExtensionContext): void {
		// Validate on open and change
		context.subscriptions.push(
			vscode.workspace.onDidOpenTextDocument((doc) => void this.validate(doc)),
			vscode.workspace.onDidChangeTextDocument(
				(e) => void this.validate(e.document),
			),
			vscode.workspace.onDidChangeConfiguration((event) => {
				if (event.affectsConfiguration('arborCss.warnOnArbitraryValues')) {
					this.validateAll();
				}
			}),
			vscode.workspace.onDidCloseTextDocument((doc) =>
				this.diagnostics.delete(doc.uri),
			),
		);

		// Re-validate all open arbor-css documents when the token map reloads
		context.subscriptions.push(
			this.tokenProvider.onDidChange(() => this.validateAll()),
		);

		// Validate already-open documents on activation
		this.validateAll();

		context.subscriptions.push(this.diagnostics);
	}

	private validateAll(): void {
		for (const doc of vscode.workspace.textDocuments) {
			void this.validate(doc);
		}
	}

	private async validate(document: vscode.TextDocument): Promise<void> {
		if (!supportedLanguages.includes(document.languageId)) return;

		const state = await this.tokenProvider.getStateForDocument(document);
		if (!state) {
			this.diagnostics.delete(document.uri);
			return;
		}

		const tokenRegexes = createTokenRegexes(state.tokenPrefixes);
		const fileDiagnostics: vscode.Diagnostic[] = [];
		const warnOnArbitraryValues = vscode
			.workspace.getConfiguration('arborCss')
			.get<boolean>(
			'warnOnArbitraryValues',
			false,
			);

		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
			const line = document.lineAt(lineIndex).text;

			if (warnOnArbitraryValues) {
				for (const warning of findArbitraryValueWarnings(
					line,
					state.tokenPrefixes,
				)) {
					const diagnostic = new vscode.Diagnostic(
						new vscode.Range(
							new vscode.Position(lineIndex, warning.start),
							new vscode.Position(lineIndex, warning.end),
						),
						warning.message,
						vscode.DiagnosticSeverity.Warning,
					);
					diagnostic.source = 'arbor-css';
					fileDiagnostics.push(diagnostic);
				}
			}

			for (const tokenRegex of tokenRegexes) {
				for (const match of line.matchAll(tokenRegex.anywhere())) {
					if (match.index === undefined) continue;
					const path = match[1];
					if (!state.tokenMap.has(path)) {
						const start = new vscode.Position(lineIndex, match.index);
						const end = new vscode.Position(
							lineIndex,
							match.index + match[0].length,
						);
						const diagnostic = new vscode.Diagnostic(
							new vscode.Range(start, end),
							`Unknown Arbor ${path.includes('fn-') ? 'function' : 'token'}: ${path}`,
							vscode.DiagnosticSeverity.Error,
						);
						diagnostic.source = 'arbor-css';
						fileDiagnostics.push(diagnostic);
					} else {
						const matchedToken = state.tokenMap.get(path);
						if (isFunction(matchedToken)) {
							// functions and mixins may only appear as assignments, not
							// properties
							const afterMatch = line
								.slice(match.index + match[0].length)
								.trimStart();
							if (afterMatch.startsWith(':')) {
								const start = new vscode.Position(lineIndex, match.index);
								const end = new vscode.Position(
									lineIndex,
									match.index + match[0].length,
								);
								const diagnostic = new vscode.Diagnostic(
									new vscode.Range(start, end),
									`Arbor functions cannot be used as property values: ${path}`,
									vscode.DiagnosticSeverity.Error,
								);
								diagnostic.source = 'arbor-css';
								fileDiagnostics.push(diagnostic);
							}
						}
						if (isMixin(matchedToken)) {
							// mixins must be preceeded by @apply
							const beforeMatch = line.slice(0, match.index).trimEnd();
							if (!beforeMatch.endsWith('@apply')) {
								const start = new vscode.Position(lineIndex, match.index);
								const end = new vscode.Position(
									lineIndex,
									match.index + match[0].length,
								);
								const diagnostic = new vscode.Diagnostic(
									new vscode.Range(start, end),
									`@apply must precede mixin: ${path}`,
									vscode.DiagnosticSeverity.Error,
								);
								diagnostic.source = 'arbor-css';
								fileDiagnostics.push(diagnostic);
							}
						}
					}
				}
			}
		}

		this.diagnostics.set(document.uri, fileDiagnostics);
	}
}
