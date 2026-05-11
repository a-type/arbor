import { getByConcatKey } from '@arbor-css/util';
import { globalKeywords } from '@unocss/preset-mini/utils';
import { Theme } from '../theme/types.js';
import { dashConcat } from './concat.js';
import { h } from './h.js';

export function getFromTheme(
	value: string,
	theme: Theme,
	{
		startFrom,
		trySuffixes,
	}: {
		startFrom?: keyof Theme | (string & {});
		trySuffixes?: string[];
	},
) {
	for (const suffix of ['', ...(trySuffixes || [])]) {
		const lookFor = dashConcat(startFrom, value, suffix);
		const themeValue = getByConcatKey(theme, lookFor, '-');
		if (themeValue) {
			if (typeof themeValue === 'object' && !!themeValue) {
				if ('' in themeValue) {
					return themeValue[''];
				}
				if ('$root' in themeValue) {
					return themeValue.$root;
				}
			} else {
				return themeValue;
			}
		}
	}
}

export function themeOrLiteral(
	value: string,
	theme: Theme,
	{
		startFrom,
		trySuffixes,
	}: {
		startFrom?: keyof Theme | (string & {});
		trySuffixes?: string[];
	},
): [
	string | undefined,
	{ source: 'theme' | 'bracket' | 'global' | 'unmatched' },
] {
	value ??= '';
	const bracketedValue = h.bracket.bracketOfColor(value);
	if (bracketedValue) {
		return [bracketedValue, { source: 'bracket' }];
	}
	if (globalKeywords.includes(value) || value === 'transparent') {
		return [value, { source: 'global' }];
	}
	const fromTheme = getFromTheme(value, theme, { startFrom, trySuffixes });
	if (fromTheme) {
		return [fromTheme, { source: 'theme' }];
	}

	return [undefined, { source: 'unmatched' }];
}
