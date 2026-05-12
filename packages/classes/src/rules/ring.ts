import { $systemProps } from '@arbor-css/globals';
import type { CSSObject, Rule, RuleContext } from '@unocss/core';
import { $classesProps } from '../properties.js';
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
					[$classesProps.ring.width.name]: value,
					[$classesProps.ring.offsetShadow.name]:
						`${$classesProps.ring.inset.var} 0 0 0 ${$classesProps.ring.offsetWidth.var} ${$systemProps.ringOffset.target.varFallback($classesProps.ring.offsetColor.var)}`,
					[$classesProps.ring.shadow.name]:
						`${$classesProps.ring.inset.var} 0 0 0 calc(${$classesProps.ring.width.var} + ${$classesProps.ring.offsetWidth.var}) ${$systemProps.ring.target.varFallback($classesProps.ring.color.var)}`,
					'box-shadow': `${$classesProps.ring.offsetShadow.var}, ${$classesProps.ring.shadow.var}, ${$classesProps.shadow.shadow.var}`,
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
	['ring-offset', { [$classesProps.ring.offsetWidth.name]: '1px' }],
	[
		/^ring-offset-(?:width-|size-)?(.+)$/,
		([, d], { theme }) => ({
			[$classesProps.ring.offsetWidth.name]:
				theme.lineWidth?.[d] ?? h.bracket.cssvar.px(d),
		}),
		{ autocomplete: 'ring-offset-(width|size)-$lineWidth' },
	],

	// TODO: what is "ring offset color..."

	// style
	['ring-inset', { [$classesProps.ring.inset.name]: 'inset' }],
];

function handleWidth(
	[, b]: string[],
	{ theme }: RuleContext<Theme>,
): CSSObject {
	return {
		[$classesProps.ring.width.name]:
			theme.ringWidth?.[b] ?? h.bracket.cssvar.px(b),
	};
}
