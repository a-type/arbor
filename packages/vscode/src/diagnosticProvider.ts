import * as vscode from 'vscode';
import { createTokenRegex } from './regex.js';
import { TokenProvider } from './tokenProvider.js';

const supportedLanguages = ['css', 'scss', 'less'];

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
			vscode.workspace.onDidOpenTextDocument((doc) => this.validate(doc)),
			vscode.workspace.onDidChangeTextDocument((e) =>
				this.validate(e.document),
			),
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
			this.validate(doc);
		}
	}

	private validate(document: vscode.TextDocument): void {
		if (!supportedLanguages.includes(document.languageId)) return;

		const tokenMap = this.tokenProvider.getTokenMap();
		const tokenRegex = createTokenRegex(this.tokenProvider.getTokenPrefix());
		const fileDiagnostics: vscode.Diagnostic[] = [];

		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
			const line = document.lineAt(lineIndex).text;
			for (const match of line.matchAll(tokenRegex.anywhere())) {
				if (match.index === undefined) continue;
				const path = match[1];
				if (!tokenMap.has(path)) {
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
				}
			}
		}

		this.diagnostics.set(document.uri, fileDiagnostics);
	}
}
