import { Theme } from '@unocss/preset-mini';
import { cornerMap, h } from '@unocss/preset-mini/utils';
import { Rule, RuleContext } from 'unocss';
import { CALCS } from '../constants/calcs';
import { PROPS } from '../constants/properties';
import { SELECTORS } from '../constants/selectors';

function* handlerRounded(
	[, a = '', s = 'DEFAULT']: string[],
	{ theme, symbols }: RuleContext<Theme>,
) {
	if (!(a in cornerMap)) {
		return;
	}

	if (s === 'nest') {
		// magic time...
		yield {
			[symbols.parent]: SELECTORS.GROUP_EVEN,
			[PROPS.GROUP.RADIUS.INHERITED]: CALCS.GROUP.NESTED_RADIUS('EVEN'),
		};
		yield {
			[symbols.parent]: SELECTORS.GROUP_ODD,
			[PROPS.GROUP.RADIUS.INHERITED]: CALCS.GROUP.NESTED_RADIUS('ODD'),
		};
		yield {
			[PROPS.GROUP.RADIUS.FINAL]: `var(${PROPS.GROUP.RADIUS.INHERITED})`,
			...Object.fromEntries(
				cornerMap[a].map((i) => [
					`border${i}-radius`,
					`var(${PROPS.GROUP.RADIUS.FINAL})`,
				]),
			),
		};
	} else {
		const value =
			theme.borderRadius?.[s] ?? h.bracket.cssvar.global.fraction.rem(s);
		if (value != null) {
			yield {
				[PROPS.GROUP.RADIUS.FINAL]: value,
				...Object.fromEntries(
					cornerMap[a].map((i) => [
						`border${i}-radius`,
						`var(${PROPS.GROUP.RADIUS.FINAL})`,
					]),
				),
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_INITIAL,
				[PROPS.GROUP.RADIUS.EVEN]: value,
				[PROPS.GROUP.RADIUS.ODD]: value,
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_EVEN,
				[PROPS.GROUP.RADIUS.EVEN]: value,
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_ODD,
				[PROPS.GROUP.RADIUS.ODD]: value,
			};
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
