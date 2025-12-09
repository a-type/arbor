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
			[PROPS.GROUP.RADIUS.INHERITED]: CALCS.GROUP.NESTED_RADIUS('ODD'),
			[PROPS.GROUP.RADIUS.EVEN]: `var(${PROPS.GROUP.RADIUS.INHERITED})`,
		};
		yield {
			[symbols.parent]: SELECTORS.GROUP_ODD,
			[PROPS.GROUP.RADIUS.INHERITED]: CALCS.GROUP.NESTED_RADIUS('EVEN'),
			[PROPS.GROUP.RADIUS.ODD]: `var(${PROPS.GROUP.RADIUS.INHERITED})`,
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
		// finally, if no parent group exists, fall back to normal radius
		yield {
			[symbols.parent]: SELECTORS.GROUP_INITIAL,
			[PROPS.GROUP.RADIUS.FINAL]: `var(${PROPS.GROUP.RADIUS.NEST_FALLBACK})`,
		};
	} else {
		const value =
			theme.borderRadius?.[s] ?? h.bracket.cssvar.global.fraction.rem(s);
		if (value != null) {
			yield {
				[PROPS.GROUP.RADIUS.FINAL]: value,
				[PROPS.GROUP.RADIUS.NEST_FALLBACK]: value,
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
		/^(?:rounded|rd)()(?:-(.+))?$/,
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
	[/^(?:rounded|rd)-([rltbse])(?:-(.+))?$/, handlerRounded],
	[/^(?:rounded|rd)-([rltb]{2})(?:-(.+))?$/, handlerRounded],
	[/^(?:rounded|rd)-([bise][se])(?:-(.+))?$/, handlerRounded],
	[/^(?:rounded|rd)-([bi][se]-[bi][se])(?:-(.+))?$/, handlerRounded],
];
