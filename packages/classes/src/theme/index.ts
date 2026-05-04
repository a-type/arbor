import { ArborConfig, isToken, Token } from '@arbor-css/core';
import { toFlatKeys } from '@arbor-css/util';
import { Theme } from './types.js';

const extraWords = [
	'colors',
	'color',
	'typography',
	'spacing',
	'space',
	'shadows',
	'shadow',
	'text',
	'font',
	'leading',
	'weight',
	'family',
	'lineHeight',
	'size',
	'width',
	'radius',
	'borderWidth',
	'borderRadius',
];
function removeExtraWords(key: string, extraWords: string[]) {
	for (const word of extraWords) {
		key = key.replaceAll(word, '');
	}
	key = key
		.replaceAll(/^-+/g, '')
		.replaceAll(/-+$/g, '')
		.replaceAll(/-+/g, '-');
	return key;
}

export function createTheme(arbor: ArborConfig<any, any>) {
	const flatPrimitiveTokens = toFlatKeys<Token>(
		arbor.primitives.$tokens,
		isToken,
		{ separator: '-' },
	);
	const flatModeTokens = toFlatKeys<Token>(
		arbor.modes.base.schema.$tokens,
		isToken,
		{ separator: '-' },
	);

	// split into theme categories
	const theme: Partial<Theme> = {};

	for (const rawKey in flatPrimitiveTokens) {
		const token = flatPrimitiveTokens[rawKey];
		const key = `_${removeExtraWords(rawKey, extraWords)}`;
		const themeCategory = token.purpose;
		if (!theme[themeCategory]) {
			theme[themeCategory] = {};
		}
		(theme[themeCategory] as Record<string, string>)[key] = token.var;
	}
	for (const rawKey in flatModeTokens) {
		const token = flatModeTokens[rawKey];
		const key = removeExtraWords(rawKey, extraWords);
		const themeCategory = token.purpose;
		if (!theme[themeCategory]) {
			theme[themeCategory] = {};
		}
		(theme[themeCategory] as Record<string, string>)[key] = token.var;
	}

	return theme as Theme;
}
