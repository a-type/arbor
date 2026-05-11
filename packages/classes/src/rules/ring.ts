import { $systemProps } from '@arbor-css/globals';
import type { CSSObject, Rule, RuleContext } from '@unocss/core';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

export const ringRules: Rule<Theme>[] = [
	// ring
	[
		/^ring(?:-(.+))?$/,
		([, d], { theme }) => {
			let [value] = themeOrLiteral(d, theme, {
				startFrom: 'border-width',
				trySuffixes: ['width', 'size'],
			});
			if (value) {
				return {
					'--🍂-ring-width': value,
					'--🍂-ring-offset-shadow':
						'var(--🍂-ring-inset) 0 0 0 var(--🍂-ring-offset-width) var(--🍂-ring-offset-color)',
					'--🍂-ring-shadow': `var(--🍂-ring-inset) 0 0 0 calc(var(--🍂-ring-width) + var(--🍂-ring-offset-width)) ${$systemProps.ring.target.var}`,
					'box-shadow':
						'var(--🍂-ring-offset-shadow), var(--🍂-ring-shadow), var(--🍂-shadow)',
				};
			}
		},
		{ autocomplete: 'ring-$ringWidth' },
	],

	// size
	[
		/^ring-(?:width-|size-)(.+)$/,
		handleWidth,
		{ autocomplete: 'ring-(width|size)-$lineWidth' },
	],

	// offset size
	['ring-offset', { '--🍂-ring-offset-width': '1px' }],
	[
		/^ring-offset-(?:width-|size-)?(.+)$/,
		([, d], { theme }) => ({
			'--🍂-ring-offset-width': theme.lineWidth?.[d] ?? h.bracket.cssvar.px(d),
		}),
		{ autocomplete: 'ring-offset-(width|size)-$lineWidth' },
	],

	// TODO: what is "ring offset color..."

	// style
	['ring-inset', { '--🍂-ring-inset': 'inset' }],
];

function handleWidth(
	[, b]: string[],
	{ theme }: RuleContext<Theme>,
): CSSObject {
	return { '--🍂-ring-width': theme.ringWidth?.[b] ?? h.bracket.cssvar.px(b) };
}
