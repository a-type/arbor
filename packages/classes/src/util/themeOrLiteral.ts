import { getByConcatKey } from '@arbor-css/util';
import { Theme } from '../theme/types.js';
import { dotConcat } from './concat.js';
import { h } from './h.js';

export function themeOrLiteral(
	value: string,
	theme: Theme,
	{
		startFrom,
		unitForLiteralNumber,
		trySuffixes,
	}: {
		startFrom?: keyof Theme | (string & {});
		unitForLiteralNumber?: string;
		trySuffixes?: string[];
	},
): [string, { source: 'theme' | 'bracket' | 'literal' }] {
	const bracketedValue = h.bracket(value);
	if (bracketedValue) {
		return [bracketedValue, { source: 'bracket' }];
	}
	for (const suffix of ['', ...(trySuffixes || [])]) {
		const lookFor = dotConcat(startFrom, value, suffix);
		const themeValue = theme ? getByConcatKey(theme, lookFor, '.') : undefined;
		if (themeValue) {
			return [themeValue, { source: 'theme' }];
		}
	}

	if (unitForLiteralNumber && /^\d+$/.test(value)) {
		return [`${value}${unitForLiteralNumber}`, { source: 'literal' }];
	}

	return [value, { source: 'literal' }];
}
