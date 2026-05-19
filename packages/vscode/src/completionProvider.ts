import { isFunction, isToken } from '@arbor-css/core';
import * as vscode from 'vscode';
import { createTokenRegex } from './regex.js';
import type { TokenProvider } from './tokenProvider.js';

export class ArborCompletionProvider implements vscode.CompletionItemProvider {
	constructor(
		private readonly tokenProvider: TokenProvider,
		private readonly outputChannel: vscode.OutputChannel,
	) {}

	async provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
	): Promise<vscode.CompletionItem[] | undefined> {
		const linePrefix = document
			.lineAt(position)
			.text.slice(0, position.character);
		const tokenPrefix =
			await this.tokenProvider.getTokenPrefixForDocument(document);
		const match = createTokenRegex(tokenPrefix).end().exec(linePrefix);
		if (!match) return undefined;

		const matched = match[1] ?? tokenPrefix;
		const segments = await this.tokenProvider.getCompletions(document, matched);
		if (!segments.length) return undefined;

		return segments.map(({ name, value }) => {
			const item = new vscode.CompletionItem(
				name,
				value ?
					isToken(value) ? vscode.CompletionItemKind.Variable
					:	vscode.CompletionItemKind.Function
				:	vscode.CompletionItemKind.Module,
			);
			// since "name" is the entire token name (--color-main-ink), e.g.
			// we need to replace the matched text with the full token name, not just the segment (main-ink)
			item.range = new vscode.Range(
				position.line,
				position.character - matched.length,
				position.line,
				position.character,
			);
			item.filterText = name;
			item.insertText = name;

			if (isToken(value)) {
				item.detail = value.name;
				item.documentation = new vscode.MarkdownString(
					[
						`**CSS property:** \`${value.name}\``,
						`**Purpose:** ${value.purpose}`,
						'**Type:** `' + value.type + '`',
					].join('\n\n'),
				);
				if (value.purpose === 'color') {
					item.kind = vscode.CompletionItemKind.Color;
				}
			} else if (isFunction(value)) {
				item.detail = value.name + `(${value.parameters.join(', ')})`;
				item.documentation = new vscode.MarkdownString(
					[
						`**CSS function:** \`${value.name}()\``,
						value.description ? `**Description:** ${value.description}` : null,
						'**Parameters:**',
						...value.parameters.map((p) => `- \`${p}\``),
					]
						.filter(Boolean)
						.join('\n\n'),
				);
			} else {
				item.detail = `Arbor token namespace`;
				// Namespace: replace matched word with full path + '-' to continue the path
				item.insertText = new vscode.SnippetString(`${item.insertText!}-`);
				item.command = {
					command: 'editor.action.triggerSuggest',
					title: 'Trigger completions',
				};
			}
			return item;
		});
	}
}
