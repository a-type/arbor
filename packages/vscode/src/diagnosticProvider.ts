import {
	createPrefixValidationConfig,
	findInvalidTokenMatches,
	formatInvalidTokenMatchMessage,
	getInternals,
} from '@arbor-css/core';
import * as vscode from 'vscode';
import { findArbitraryValueWarnings } from './arbitraryValueDiagnostics.js';
import { findFunctionParamErrors } from './functionParamDiagnostics.js';
import { TokenProvider } from './tokenProvider.js';

/**
 * Returns true when the character position `index` on `line` is inside a CSS
 * block comment, taking into account that a comment may have been opened on a
 * previous line (`inBlockComment === true` on entry).
 *
 * Also returns the updated `inBlockComment` state after processing the full
 * line, so the caller can pass it to the next iteration.
 */
function isInComment(
	line: string,
	index: number,
	inBlockComment: boolean,
): boolean {
	let i = 0;
	let inside = inBlockComment;
	while (i < line.length) {
		if (inside) {
			const close = line.indexOf('*/', i);
			if (close === -1) {
				// Entire rest of line is inside a comment.
				return index >= i;
			}
			// Comment closes at `close`.
			if (index < close + 2) return true;
			inside = false;
			i = close + 2;
		} else {
			const open = line.indexOf('/*', i);
			if (open === -1) return false;
			if (index < open) return false;
			inside = true;
			i = open + 2;
		}
	}
	return inside;
}

/**
 * Advances the block-comment tracking state past a full line, returning the
 * new state to carry into the next line.
 */
function advanceCommentState(line: string, inBlockComment: boolean): boolean {
	let i = 0;
	let inside = inBlockComment;
	while (i < line.length) {
		if (inside) {
			const close = line.indexOf('*/', i);
			if (close === -1) return true;
			inside = false;
			i = close + 2;
		} else {
			const open = line.indexOf('/*', i);
			if (open === -1) return false;
			inside = true;
			i = open + 2;
		}
	}
	return inside;
}

// Pure CSS-family languages handled directly.
const styleDiagnosticLanguages = [
	'css',
	'scss',
	'less',
	// Host language IDs for files that embed CSS in <style> blocks.
	'astro',
	'svelte',
	'vue',
	'html',
];
// Languages to validate @mode-xxx class names
const classDiagnosticLanguages = [
	'html',
	'astro',
	'svelte',
	'vue',
	'javascript',
	'typescript',
	'javascriptreact',
	'typescriptreact',
	'php',
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
		const diagnosticsForDoc: vscode.Diagnostic[] = [];
		if (styleDiagnosticLanguages.includes(document.languageId)) {
			diagnosticsForDoc.push(...(await this.validateStyles(document)));
		}
		if (classDiagnosticLanguages.includes(document.languageId)) {
			diagnosticsForDoc.push(...(await this.validateClasses(document)));
		}

		if (!diagnosticsForDoc.length) {
			this.diagnostics.delete(document.uri);
		} else {
			this.diagnostics.set(document.uri, diagnosticsForDoc);
		}
	}

	private async validateStyles(
		document: vscode.TextDocument,
	): Promise<vscode.Diagnostic[]> {
		const state = await this.tokenProvider.getStateForDocument(document);
		if (!state) {
			return [];
		}

		const fileDiagnostics: vscode.Diagnostic[] = [];
		const warnOnArbitraryValues = vscode.workspace
			.getConfiguration('arborCss')
			.get<boolean>('warnOnArbitraryValues', false);
		const content = document.getText();
		const prefixConfig = createPrefixValidationConfig(
			state.preset.context.tokenPrefixes,
		);

		for (const match of findInvalidTokenMatches({
			content,
			tokenMap: state.tokenMap,
			prefixConfig,
		})) {
			const diagnostic = new vscode.Diagnostic(
				new vscode.Range(
					document.positionAt(match.index),
					document.positionAt(match.index + match.length),
				),
				formatInvalidTokenMatchMessage(match),
				vscode.DiagnosticSeverity.Error,
			);
			diagnostic.source = 'arbor-css';
			fileDiagnostics.push(diagnostic);
		}

		let inBlockComment = false;

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

			if (!isInComment(line, 0, inBlockComment)) {
				for (const error of findFunctionParamErrors(line, state.tokenMap)) {
					const diagnostic = new vscode.Diagnostic(
						new vscode.Range(
							new vscode.Position(lineIndex, error.start),
							new vscode.Position(lineIndex, error.end),
						),
						error.message,
						vscode.DiagnosticSeverity.Error,
					);
					diagnostic.source = 'arbor-css';
					fileDiagnostics.push(diagnostic);
				}
			}

			inBlockComment = advanceCommentState(line, inBlockComment);
		}

		return fileDiagnostics;
	}

	private async validateClasses(
		document: vscode.TextDocument,
	): Promise<vscode.Diagnostic[]> {
		const state = await this.tokenProvider.getStateForDocument(document);
		if (!state) {
			return [];
		}

		// validate every "@mode-___" string matches a mode defined in the preset
		const modes = ['base', ...Object.keys(getInternals(state.preset).modes)];
		const modeRegex = /@mode-([a-zA-Z0-9_-]+)/g;
		const fileDiagnostics: vscode.Diagnostic[] = [];
		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
			const line = document.lineAt(lineIndex).text;
			for (const match of line.matchAll(modeRegex)) {
				if (match.index === undefined) continue;
				const modeName = match[1];
				if (!modes.includes(modeName)) {
					const start = new vscode.Position(lineIndex, match.index);
					const end = new vscode.Position(
						lineIndex,
						match.index + match[0].length,
					);
					const diagnostic = new vscode.Diagnostic(
						new vscode.Range(start, end),
						`Unknown Arbor mode: ${modeName}`,
						vscode.DiagnosticSeverity.Error,
					);
					diagnostic.source = 'arbor-css';
					fileDiagnostics.push(diagnostic);
				}
			}
		}
		return fileDiagnostics;
	}
}
