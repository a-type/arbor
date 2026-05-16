import * as vscode from 'vscode';
import type { TokenProvider } from './tokenProvider.js';

/** Matches a complete `$.token.path` reference */
const TOKEN_RE = /\$\.([\w.]+)/g;

export class ArborHoverProvider implements vscode.HoverProvider {
	constructor(private readonly tokenProvider: TokenProvider) {}

	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
	): vscode.Hover | undefined {
		const line = document.lineAt(position).text;
		const tokenMap = this.tokenProvider.getTokenMap();

		// Find all token references on this line and see if the cursor is inside one
		for (const match of line.matchAll(TOKEN_RE)) {
			if (match.index === undefined) continue;
			const start = match.index;
			const end = start + match[0].length;
			if (position.character < start || position.character > end) continue;

			const path = match[1];
			const entry = tokenMap.get(path);

			const range = new vscode.Range(
				position.line,
				start,
				position.line,
				end,
			);

			if (!entry) {
				return new vscode.Hover(
					new vscode.MarkdownString(`⚠️ Unknown Arbor token: \`$.${path}\``),
					range,
				);
			}

			const md = new vscode.MarkdownString();
			md.appendMarkdown(`**Arbor token** \`$.${path}\`\n\n`);
			md.appendMarkdown(`**Resolves to:** \`${entry.cssVar}\`\n\n`);
			md.appendMarkdown(`**Custom property:** \`${entry.name}\`\n\n`);
			md.appendMarkdown(`**Purpose:** ${entry.purpose}`);

			// For color tokens, add a color swatch using a markdown color preview
			if (entry.purpose === 'color') {
				md.appendMarkdown(`\n\n*(color token)*`);
			}

			return new vscode.Hover(md, range);
		}

		return undefined;
	}
}
