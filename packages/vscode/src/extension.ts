import * as vscode from 'vscode';
import { ArborCompletionProvider } from './completionProvider.js';
import { ArborDiagnosticProvider } from './diagnosticProvider.js';
import { ArborHoverProvider } from './hoverProvider.js';
import { TokenProvider } from './tokenProvider.js';

export function activate(context: vscode.ExtensionContext): void {
	const outputChannel = vscode.window.createOutputChannel('Arbor CSS');
	outputChannel.appendLine('Activating Arbor CSS extension...');
	const languageSelector: vscode.DocumentSelector = ['css', 'scss', 'less'];

	const tokenProvider = new TokenProvider(outputChannel);

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			tokenProvider.reset();
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				void tokenProvider.primeDocument(editor.document);
			}
		}),
		vscode.workspace.onDidOpenTextDocument((document) => {
			void tokenProvider.primeDocument(document);
		}),
	);

	for (const document of vscode.workspace.textDocuments) {
		void tokenProvider.primeDocument(document);
	}
	if (vscode.window.activeTextEditor) {
		void tokenProvider.primeDocument(vscode.window.activeTextEditor.document);
	}

	/**
	 * Activate for all CSS, SCSS, and LESS files since Arbor tokens can be used in any of these. We could
	 * potentially narrow this down to only activate on files that also contain Arbor-prefixed token references, but that would
	 * require more complex logic to watch for file changes and re-activate providers, and might miss some edge cases, so we'll keep it simple for now.
	 */

	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			languageSelector,
			new ArborCompletionProvider(tokenProvider, outputChannel),
			'-', // trigger character
		),
	);

	// Hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			languageSelector,
			new ArborHoverProvider(tokenProvider),
		),
	);

	// Diagnostic provider — red underlines for unknown tokens
	new ArborDiagnosticProvider(tokenProvider).register(context);

	// Refresh completions when config changes
	context.subscriptions.push(
		tokenProvider.onDidChange(() => {
			// Force VS Code to re-request completions by briefly toggling something
			// (No direct API to invalidate completion cache, but providers are re-called on next trigger)
		}),
	);

	context.subscriptions.push(tokenProvider);

	console.log('[arbor-css] Extension activated');
}

export function deactivate(): void {}
