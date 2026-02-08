import { Theme } from '@unocss/preset-mini';
import { cornerMap, h } from '@unocss/preset-mini/utils';
import { Rule, RuleContext } from 'unocss';
import { groupRule } from './_util';

function* handlerRounded(
	[, a = '', s = 'DEFAULT']: string[],
	ctx: RuleContext<Theme>,
) {
	if (!(a in cornerMap)) {
		return;
	}

	const { theme } = ctx;

	// if (s === 'nest') {
	// 	// magic time...
	// 	yield* groupRule(
	// 		'RADIUS',
	// 		cornerMap[a].map((i) => `border${i}-radius`),
	// 		() => CALCS.GROUP.NESTED_RADIUS(),
	// 		ctx,
	// 		true,
	// 	);
	// }

	const value =
		theme.borderRadius?.[s] ?? h.bracket.cssvar.global.fraction.rem(s);
	if (value != null) {
		yield* groupRule(
			'RADIUS',
			cornerMap[a].map((i) => `border${i}-radius`),
			value,
			ctx,
			true,
		);
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
