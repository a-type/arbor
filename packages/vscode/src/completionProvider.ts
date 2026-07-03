import {
	isFunction,
	isFunctionParamWithMeta,
	isMixin,
	isToken,
} from '@arbor-css/core';
import * as vscode from 'vscode';
import { paramToCompletionInline } from './format.js';
import { parseLiteralsFromSyntax } from './functionParamDiagnostics.js';
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

		// Check for literal parameter value completions inside a function/mixin call
		const funcContext = extractFunctionCallContext(linePrefix);
		if (funcContext) {
			const { funcName, argsText } = funcContext;
			const paramIndex = countTopLevelCommas(argsText);
			const partialText = getLastTopLevelArg(argsText).trimStart();

			// Don't intercept token references — let the existing path handle those
			if (!partialText.startsWith('-')) {
				const state = await this.tokenProvider.getStateForDocument(document);
				if (state) {
					const value = state.tokenMap.get(funcName);
					if (value && (isFunction(value) || isMixin(value))) {
						const params = value.parameters ?? [];
						const param = params[paramIndex];
						if (param !== undefined) {
							let syntax: string | undefined;
							if (isFunctionParamWithMeta(param)) {
								syntax = param.syntax ?? param.type;
							} else if (isToken(param)) {
								syntax = param.syntax;
							}
							if (syntax) {
								const literals = parseLiteralsFromSyntax(syntax);
								if (literals.length > 0) {
									const filtered =
										partialText ?
											literals.filter((lit) =>
												lit.toLowerCase().startsWith(partialText.toLowerCase()),
											)
										:	literals;
									if (filtered.length > 0) {
										return filtered.map((literal) => {
											const item = new vscode.CompletionItem(
												literal,
												vscode.CompletionItemKind.EnumMember,
											);
											item.range = new vscode.Range(
												position.line,
												position.character - partialText.length,
												position.line,
												position.character,
											);
											item.filterText = literal;
											item.insertText = literal;
											item.detail = `Parameter ${paramIndex + 1} of ${funcName}`;
											return item;
										});
									}
								}
							}
						}
					}
				}
			}
		}

		// match anything starting with --
		const match = /(--?[\w-]*)$/.exec(linePrefix);
		if (!match) return undefined;

		const matched = match[1];
		if (!matched) return undefined;
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
						`\`${value.name}\``,
						value.description ? `${value.description}` : null,
						`**Purpose:** ${value.purpose}`,
						'**Syntax:** `' + value.syntax + '`',
					]
						.filter(Boolean)
						.join('\n\n'),
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
						...value.parameters
							.map(paramToCompletionInline)
							.map((p) => `- \`${p}\``),
					]
						.filter(Boolean)
						.join('\n\n'),
				);
				item.insertText = new vscode.SnippetString(
					`${item.insertText!}${
						value.parameters.length > 0 ?
							`(${value.parameters
								.map(paramToCompletionInline)
								.map((p, i) => `\${${i + 1}:${p}}`)
								.join(', ')})`
						:	''
					}`,
				);
			} else if (isMixin(value)) {
				item.detail = value.name + `(${value.parameters.join(', ')})`;
				item.documentation = new vscode.MarkdownString(
					[
						`**CSS mixin:** \`${value.name}()\``,
						value.description ? `**Description:** ${value.description}` : null,
						'**Parameters:**',
						...value.parameters
							.map(paramToCompletionInline)
							.map((p: string) => `- \`${p}\``),
						'**Contributed tokens:**',
						...Object.values(value.contributeTokens).map(
							(t) => `- \`${t.name}\`: ${t.purpose}`,
						),
					]
						.filter(Boolean)
						.join('\n\n'),
				);
				item.insertText = new vscode.SnippetString(
					`${item.insertText!}${
						value.parameters.length > 0 ?
							`(${value.parameters
								.map(paramToCompletionInline)
								.map((p: string, i: number) => `\${${i + 1}:${p}}`)
								.join(', ')})`
						:	''
					}`,
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

/**
 * Scan backwards through linePrefix to find the innermost unclosed `--name(`
 * call, returning the function name and the text of arguments typed so far.
 */
function extractFunctionCallContext(
	linePrefix: string,
): { funcName: string; argsText: string } | null {
	let depth = 0;
	for (let i = linePrefix.length - 1; i >= 0; i--) {
		const char = linePrefix[i];
		if (char === ')') {
			depth++;
		} else if (char === '(') {
			if (depth === 0) {
				const before = linePrefix.slice(0, i);
				const nameMatch = /(--[\w-]+)$/.exec(before);
				if (nameMatch) {
					return { funcName: nameMatch[1], argsText: linePrefix.slice(i + 1) };
				}
			} else {
				depth--;
			}
		}
	}
	return null;
}

function countTopLevelCommas(text: string): number {
	let count = 0;
	let depth = 0;
	for (const char of text) {
		if (char === '(') depth++;
		else if (char === ')') depth--;
		else if (char === ',' && depth === 0) count++;
	}
	return count;
}

function getLastTopLevelArg(text: string): string {
	let depth = 0;
	let lastCommaIdx = -1;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char === '(') depth++;
		else if (char === ')') depth--;
		else if (char === ',' && depth === 0) lastCommaIdx = i;
	}
	return text.slice(lastCommaIdx + 1);
}
