import * as vscode from 'vscode';
import { resolveTokenReferences } from '@arbor-css/core';
import type { TokenProvider } from './tokenProvider.js';

/** Matches a complete `$.token.path` reference */
const TOKEN_RE = /\$\.([\w.]+)/g;

/** Matches an OKLCH color value */
const OKLCH_RE = /^oklch\(/i;

function makeColorSwatch(color: string): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="12" rx="2" fill="${color}"/></svg>`;
	const encoded = Buffer.from(svg).toString('base64');
	return `![color swatch](data:image/svg+xml;base64,${encoded})`;
}

export class ArborHoverProvider implements vscode.HoverProvider {
	constructor(private readonly tokenProvider: TokenProvider) {}

	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
	): vscode.Hover | undefined {
		const line = document.lineAt(position).text;
		const tokenMap = this.tokenProvider.getTokenMap();
		const preset = this.tokenProvider.getPreset();

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
			md.supportHtml = true;
			md.appendMarkdown(`**Arbor token** \`$.${path}\`\n\n`);
			md.appendMarkdown(`**Resolves to:** \`${entry.cssVar}\`\n\n`);
			md.appendMarkdown(`**Custom property:** \`${entry.name}\`\n\n`);
			md.appendMarkdown(`**Purpose:** ${entry.purpose}`);

			if (entry.purpose === 'color' && preset) {
				const resolved = resolveTokenReferences(preset, entry.name);
				if (resolved) {
					if (OKLCH_RE.test(resolved)) {
						md.appendMarkdown(`\n\n${makeColorSwatch(resolved)} \`${resolved}\``);
					} else {
						md.appendMarkdown(`\n\n**Color value:** \`${resolved}\``);
					}
				}
			}

			return new vscode.Hover(md, range);
		}

		return undefined;
	}
}
