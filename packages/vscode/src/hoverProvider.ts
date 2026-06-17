import { isFunction, isMixin, isToken } from '@arbor-css/core';
import * as vscode from 'vscode';
import { createTokenRegexes } from './regex.js';
import {
	resolveColorTokenValue,
	resolveTokenValue,
} from './resolvedTokenValue.js';
import type { TokenProvider } from './tokenProvider.js';

function makeColorSwatch(color: string): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="12" rx="2" fill="${color}" stroke="black"/></svg>`;
	const encoded = Buffer.from(svg).toString('base64');
	return `![color swatch](data:image/svg+xml;base64,${encoded})`;
}

export class ArborHoverProvider implements vscode.HoverProvider {
	constructor(private readonly tokenProvider: TokenProvider) {}

	async provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
	): Promise<vscode.Hover | undefined> {
		const line = document.lineAt(position).text;
		const state = await this.tokenProvider.getStateForDocument(document);
		if (!state) return undefined;

		const tokenRegexes = createTokenRegexes(state.tokenPrefixes);

		// Find all token references on this line and see if the cursor is inside one
		for (const tokenRegex of tokenRegexes) {
			for (const match of line.matchAll(tokenRegex.anywhere())) {
				if (match.index === undefined) continue;
				const start = match.index;
				const end = start + match[0].length;
				if (position.character < start || position.character > end) continue;

				const path = match[1];
				const entry = state.tokenMap.get(path);

				const range = new vscode.Range(
					position.line,
					start,
					position.line,
					end,
				);

				if (!entry) {
					return new vscode.Hover(
						new vscode.MarkdownString(
							`⚠️ Unknown Arbor token/function: \`${path}\``,
						),
						range,
					);
				}

				const md = new vscode.MarkdownString();
				md.supportHtml = true;
				if (isToken(entry)) {
					md.appendMarkdown(`**Arbor token:** \`${entry.name}\`\n\n`);
					md.appendMarkdown(`**Purpose:** ${entry.purpose}`);
					if (entry.contributedBy) {
						md.appendMarkdown(`\n\n*Contributed by ${entry.contributedBy}*`);
					}
					if (entry.description) {
						md.appendMarkdown(`\n\n${entry.description}`);
					}
					const resolved = await resolveTokenValue(state, entry);
					const resolvedColor = await resolveColorTokenValue(state, entry);

					if (resolvedColor) {
						md.appendMarkdown(
							`\n\n${makeColorSwatch(resolvedColor)} \`${resolvedColor}\``,
						);
					} else {
						md.appendMarkdown(
							`\n\n**Value (@mode-base):** \`${resolved ?? 'unresolved'}\``,
						);
					}
				} else if (isFunction(entry)) {
					md.appendMarkdown(`**Arbor function:** \`${entry.signature}\``);
					md.appendMarkdown(`\n\n${entry.description ?? '(no description)'}`);
				} else if (isMixin(entry)) {
					md.appendMarkdown(`**Arbor mixin:** \`${entry.signature}\``);
					md.appendMarkdown(`\n\n${entry.description ?? '(no description)'}`);
					md.appendMarkdown(`\n\n**Contributed tokens:**`);
					for (const tokenName in entry.contributeTokens) {
						const token = entry.contributeTokens[tokenName];
						md.appendMarkdown(`\n- \`${token.name}\`: ${token.purpose}`);
					}
				}

				return new vscode.Hover(md, range);
			}
		}

		return undefined;
	}
}
