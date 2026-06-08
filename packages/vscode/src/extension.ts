import * as vscode from 'vscode';
import { ArborCompletionProvider } from './completionProvider.js';
import { ArborDiagnosticProvider } from './diagnosticProvider.js';
import { ArborDocumentColorProvider } from './documentColorProvider.js';
import { ArborHoverProvider } from './hoverProvider.js';
import { TokenProvider } from './tokenProvider.js';

export function activate(context: vscode.ExtensionContext): void {
	const outputChannel = vscode.window.createOutputChannel('Arbor CSS');
	outputChannel.appendLine('Activating Arbor CSS extension...');
	// Standard CSS-family languages plus embedded-language host file types.
	// For .astro, .svelte, .vue, and .html files VS Code creates virtual CSS
	// documents (scheme "embedded-content") for <style> blocks, but the
	// completion/hover/color providers are called with those virtual docs.
	// Including the host language IDs here ensures the extension also
	// activates and receives requests when those files are open.
	const languageSelector: vscode.DocumentSelector = [
		'css',
		'scss',
		'less',
		'astro',
		'svelte',
		'vue',
		'html',
	];
	const completionTriggerCharacters = Array.from(
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-',
	);

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
	outputChannel.appendLine(
		'Registered event listeners for workspace folder changes, active editor changes, and document opens.',
	);

	outputChannel.appendLine(
		`Priming token provider with open documents (${vscode.workspace.textDocuments.length})...`,
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
			...completionTriggerCharacters,
		),
	);
	outputChannel.appendLine('Registered completion item provider.');

	// Hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			languageSelector,
			new ArborHoverProvider(tokenProvider),
		),
	);
	outputChannel.appendLine('Registered hover provider.');

	context.subscriptions.push(
		vscode.languages.registerColorProvider(
			languageSelector,
			new ArborDocumentColorProvider(tokenProvider),
		),
	);
	outputChannel.appendLine('Registered document color provider.');

	// Diagnostic provider — red underlines for unknown tokens
	new ArborDiagnosticProvider(tokenProvider).register(context);
	outputChannel.appendLine('Registered diagnostic provider.');

	// idk what this is meant to do tbh
	context.subscriptions.push(tokenProvider.onDidChange(() => {}));
	outputChannel.appendLine('Registered configuration change listener.');

	context.subscriptions.push(tokenProvider);
	outputChannel.appendLine('Extension activated.');
}

export function deactivate(): void {}
