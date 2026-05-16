import * as vscode from 'vscode';
import type { TokenProvider } from './tokenProvider.js';

/** Matches `$.` (possibly with partial path) in CSS property names or values */
const TOKEN_START_RE = /\$\.([\w.]*)$/;

/**
 * Returns true if the cursor is on the property side of a declaration
 * (i.e., the `$.token.path` appears before any `:` on the line).
 */
function isPropertySideContext(
	linePrefix: string,
	matchStart: number,
): boolean {
	const precedingText = linePrefix.slice(0, matchStart);
	return !precedingText.includes(':');
}

export class ArborCompletionProvider implements vscode.CompletionItemProvider {
	constructor(private readonly tokenProvider: TokenProvider) {}

	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
	): vscode.CompletionItem[] | undefined {
		const linePrefix = document
			.lineAt(position)
			.text.slice(0, position.character);
		const match = TOKEN_START_RE.exec(linePrefix);
		if (!match) return undefined;

		const currentPath = match[1]; // everything typed after `$.`
		const matchStart = linePrefix.length - match[0].length;
		const onPropertySide = isPropertySideContext(linePrefix, matchStart);
		// Remove the trailing segment being typed (we complete the next segment)
		const lastDot = currentPath.lastIndexOf('.');
		const prefix = lastDot >= 0 ? currentPath.slice(0, lastDot) : '';
		const partialSegment =
			lastDot >= 0 ? currentPath.slice(lastDot + 1) : currentPath;

		const segments = this.tokenProvider.getCompletionSegments(prefix);
		if (!segments.length) return undefined;

		return segments
			.filter(({ segment }) =>
				partialSegment ? segment.startsWith(partialSegment) : true,
			)
			.map(({ segment, isLeaf }) => {
				const fullPath = prefix ? `${prefix}.${segment}` : segment;
				const tokenEntry =
					isLeaf ? this.tokenProvider.getTokenMap().get(fullPath) : undefined;

				const item = new vscode.CompletionItem(
					segment,
					isLeaf ?
						vscode.CompletionItemKind.Variable
					:	vscode.CompletionItemKind.Module,
				);

				if (tokenEntry) {
					item.detail = onPropertySide ? tokenEntry.name : tokenEntry.var;
					item.documentation = new vscode.MarkdownString(
						[
							onPropertySide ?
								`**Assigns CSS variable:** \`${tokenEntry.name}\``
							:	`**CSS property:** \`${tokenEntry.name}\``,

							`**Purpose:** ${tokenEntry.purpose}`,
						].join('\n\n'),
					);
					if (tokenEntry.purpose === 'color') {
						item.kind = vscode.CompletionItemKind.Color;
					}
				} else {
					item.detail = `Arbor token namespace`;
				}

				// If it's a namespace (not a leaf), auto-insert a `.` to continue the path
				if (!isLeaf) {
					item.insertText = new vscode.SnippetString(`${segment}.`);
					item.command = {
						command: 'editor.action.triggerSuggest',
						title: 'Trigger completions',
					};
				}

				return item;
			});
	}
}
