import * as vscode from 'vscode';
import { ArborCompletionProvider } from './completionProvider.js';
import { ArborHoverProvider } from './hoverProvider.js';
import { TokenProvider } from './tokenProvider.js';

const ARBOR_CSS_LANG = 'arbor-css';

export function activate(context: vscode.ExtensionContext): void {
	const tokenProvider = new TokenProvider();

	// Initialize per workspace folder
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders?.length) {
		// Use the first workspace folder; multi-root workspaces would need per-folder providers
		tokenProvider.initialize(workspaceFolders[0]).catch((err) => {
			console.error('[arbor-css] Failed to initialize token provider:', err);
		});
	}

	// Re-initialize when workspace folders change
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(async () => {
			const folders = vscode.workspace.workspaceFolders;
			if (folders?.length) {
				await tokenProvider.initialize(folders[0]);
			}
		}),
	);

	const langSelector: vscode.DocumentSelector = { language: ARBOR_CSS_LANG };

	// Completion provider — triggered on `.` within `$.path` expressions
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			langSelector,
			new ArborCompletionProvider(tokenProvider),
			'.', // trigger character
		),
	);

	// Hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			langSelector,
			new ArborHoverProvider(tokenProvider),
		),
	);

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
