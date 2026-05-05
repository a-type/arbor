import { getByConcatKey } from '@arbor-css/util';
import { globalKeywords } from '@unocss/preset-mini/utils';
import { Theme } from '../theme/types.js';
import { dashConcat } from './concat.js';
import { h } from './h.js';

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
	const bracketedValue = h.bracket.bracketOfColor(value);
	if (bracketedValue) {
		return [bracketedValue, { source: 'bracket' }];
	}
	if (globalKeywords.includes(value) || value === 'transparent') {
		return [value, { source: 'global' }];
	}
	for (const suffix of ['', ...(trySuffixes || [])]) {
		const lookFor = dashConcat(startFrom, value, suffix);
		const themeValue = theme ? getByConcatKey(theme, lookFor, '-') : undefined;
		if (themeValue) {
			return [themeValue, { source: 'theme' }];
		}
	}

	return [undefined, { source: 'unmatched' }];

	// if (unitForLiteralNumber && /^\d+$/.test(value)) {
	// 	return [`${value}${unitForLiteralNumber}`, { source: 'literal' }];
	// }

	// return [value, { source: 'literal' }];
}
