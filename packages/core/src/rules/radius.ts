import { Theme } from '@unocss/preset-mini';
import { cornerMap, h } from '@unocss/preset-mini/utils';
import { CSSEntries, CSSEntry, Rule, RuleContext } from 'unocss';
import { PROPS } from '../constants/properties';

function handlerRounded(
	[, a = '', s = 'DEFAULT']: string[],
	{ theme }: RuleContext<Theme>,
): CSSEntries | undefined {
	if (a in cornerMap) {
		const value =
			theme.borderRadius?.[s] ?? h.bracket.cssvar.global.fraction.rem(s);
		if (value != null) {
			return [
				[PROPS.GROUP.RADIUS, value] satisfies CSSEntry,
				...cornerMap[a].map(
					(i) => [`border${i}-radius`, value] satisfies CSSEntry,
				),
			];
		}
	}
}

export const radiusRules: Rule[] = [
	[
		/^(?:border-|b-)?(?:rounded|rd)()(?:-(.+))?$/,
		handlerRounded,
		{
			autocomplete: [
				'(border|b)-(rounded|rd)',
				'(border|b)-(rounded|rd)-$radius',
				'(rounded|rd)',
				'(rounded|rd)-$radius',
			],
		},
	],
	[/^(?:border-|b-)?(?:rounded|rd)-([rltbse])(?:-(.+))?$/, handlerRounded],
	[/^(?:border-|b-)?(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],
	[/^(?:border-|b-)?(?:rounded|rd)-([bise][se])(?:-(.+))?$/, handlerRounded],
	[
		/^(?:border-|b-)?(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/,
		handlerRounded,
	],
];
