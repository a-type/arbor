import * as vscode from 'vscode';
import { parseCssColor } from './colorValue.js';
import { createTokenRegexes } from './regex.js';
import { resolveColorTokenValueByName } from './resolvedTokenValue.js';
import type { TokenProvider } from './tokenProvider.js';

export class ArborDocumentColorProvider
	implements vscode.DocumentColorProvider
{
	constructor(private readonly tokenProvider: TokenProvider) {}

	async provideDocumentColors(
		document: vscode.TextDocument,
	): Promise<vscode.ColorInformation[]> {
		const state = await this.tokenProvider.getStateForDocument(document);
		if (!state) {
			return [];
		}

		const tokenRegexes = createTokenRegexes(state.tokenPrefixes);
		const colors: vscode.ColorInformation[] = [];

		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
			const line = document.lineAt(lineIndex).text;
			for (const tokenRegex of tokenRegexes)
				for (const match of line.matchAll(tokenRegex.anywhere())) {
					if (match.index === undefined) {
						continue;
					}

					const resolved = await resolveColorTokenValueByName(state, match[1]);
					if (!resolved) {
						continue;
					}

					const rgba = parseCssColor(resolved);
					if (!rgba) {
						continue;
					}

					const range = new vscode.Range(
						lineIndex,
						match.index,
						lineIndex,
						match.index + match[0].length,
					);

					colors.push(
						new vscode.ColorInformation(
							range,
							new vscode.Color(rgba.red, rgba.green, rgba.blue, rgba.alpha),
						),
					);
				}
		}

		return colors;
	}

	provideColorPresentations(
		_color: vscode.Color,
		context: { document: vscode.TextDocument; range: vscode.Range },
	): vscode.ColorPresentation[] {
		return [
			new vscode.ColorPresentation(context.document.getText(context.range)),
		];
	}
}
