import type { CSSObject, Rule } from '@unocss/core';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';
import { getFromTheme, themeOrLiteral } from '../util/themeOrLiteral.js';

export const typographyRules: Rule<Theme>[] = [
	// text
	[
		/^text-(.+)$/,
		([, input], { theme }) => {
			// capable of combining all typography tokens related to one keyword.

			// if it's a bracketed value, treat it as font-size
			const asLiteral = h.bracket(input);
			if (asLiteral) {
				return {
					'font-size': asLiteral,
				};
			}

			const size = getFromTheme(input, theme, {
				startFrom: 'font-size',
				trySuffixes: ['fontSize', 'size'],
			});
			const lineHeight = getFromTheme(input, theme, {
				startFrom: 'line-height',
				trySuffixes: ['lineHeight', 'leading'],
			});
			const letterSpacing = getFromTheme(input, theme, {
				startFrom: 'letter-spacing',
				trySuffixes: ['letterSpacing', 'tracking'],
			});
			const weight = getFromTheme(input, theme, {
				startFrom: 'font-weight',
				trySuffixes: ['fontWeight', 'weight'],
			});
			const fontFamily = getFromTheme(input, theme, {
				startFrom: 'font-family',
				trySuffixes: ['fontFamily', 'family'],
			});

			const result: CSSObject = {};
			if (size) result['font-size'] = size;
			if (lineHeight) result['line-height'] = lineHeight;
			if (letterSpacing) result['letter-spacing'] = letterSpacing;
			if (weight) result['font-weight'] = weight;
			if (fontFamily) result['font-family'] = fontFamily;

			return Object.keys(result).length > 0 ? result : undefined;
		},
		{ autocomplete: 'text-$fontSize' },
	],

	// text size
	[
		/^(?:text|font)-size-(.+)$/,
		([, s], { theme }) => {
			const [value] = themeOrLiteral(s, theme, {
				startFrom: 'font-size',
				trySuffixes: ['fontSize'],
			});
			if (value) {
				return { 'font-size': value };
			}
		},
		{ autocomplete: 'text-size-$fontSize' },
	],

	// weights
	[
		/^(?:font|fw)-?([^-]+)$/,
		([, s], { theme }) => {
			const [value] = themeOrLiteral(s, theme, {
				startFrom: 'font-weight',
				trySuffixes: ['fontWeight'],
			});
			if (value) {
				return { 'font-weight': value };
			}
		},
		{
			autocomplete: [
				'(font|fw)-(100|200|300|400|500|600|700|800|900)',
				'(font|fw)-$font-weight',
			],
		},
	],

	// leadings
	[
		/^(?:font-)?(?:leading|lh|line-height)-(.+)$/,
		([, s], { theme }) => {
			const [value] = themeOrLiteral(s, theme, {
				startFrom: 'line-height',
				trySuffixes: ['lineHeight'],
			});
			if (value) {
				return { 'line-height': value };
			}
		},
		{ autocomplete: '(leading|lh|line-height)-$line-height' },
	],

	// tracking
	[
		/^(?:font-)?tracking-(.+)$/,
		([, s], { theme }) => ({
			'letter-spacing':
				theme['letter-spacing']?.[s] || h.bracket.cssvar.global.rem(s),
		}),
		{ autocomplete: 'tracking-$letter-spacing' },
	],

	// word-spacing
	[
		/^(?:font-)?word-spacing-(.+)$/,
		([, s], { theme }) => ({
			'word-spacing': theme.wordSpacing?.[s] || h.bracket.cssvar.global.rem(s),
		}),
		{ autocomplete: 'word-spacing-$wordSpacing' },
	],

	// family
	[
		/^font-(.+)$/,
		([, d], { theme }) => {
			const [value] = themeOrLiteral(d, theme, {
				startFrom: 'font-family',
				trySuffixes: ['fontFamily', 'family'],
			});
			if (value) {
				return { 'font-family': value };
			}
		},
		{ autocomplete: 'font-$font-family' },
	],
];
