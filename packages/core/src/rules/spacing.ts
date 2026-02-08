import { Theme } from '@unocss/preset-mini';
import { directionMap, h } from '@unocss/preset-mini/utils';
import { Rule, RuleContext } from 'unocss';
import { groupRule } from './_util';

function directionSize(
	propertyPrefix: string,
	sysProps: 'PADDING' | 'MARGIN' | 'GAP',
) {
	return function* (
		[_, directionOrSize, maybeSize]: string[],
		ctx: RuleContext<Theme>,
	) {
		let direction: string = '';
		let size = maybeSize ? maybeSize : directionOrSize;
		if (maybeSize) {
			direction = directionOrSize;
		}

		let baseValue =
			ctx.theme.spacing?.[size || 'DEFAULT'] ??
			h.bracket.cssvar.global.auto.fraction.rem(size);

		if (size?.startsWith('-')) {
			if (baseValue === null) {
				baseValue = ctx.theme.spacing?.[size.slice(1)];
			}
			baseValue = `calc(${baseValue} * -1)`;
		}

		if (baseValue) {
			yield* groupRule(
				sysProps,
				directionMap[direction].map((i) => `${propertyPrefix}${i}`),
				baseValue,
				ctx,
				true,
			);
		}
	};
}

export const spacingRules: Rule[] = [
	[/^p$/, directionSize('padding', 'PADDING'), { autocomplete: 'p' }],
	[
		/^pa?()-(.+)$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)' },
	],
	[
		/^p-xy()()$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)-(xy)' },
	],
	[
		/^p-?([xy])(?:-(.+))?$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)-(x|y)-<num>' },
	],
	[
		/^p-?([rltbse])(?:-(.+))?$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)<directions>-<num>' },
	],
	[
		/^p-(block|inline)(?:-(.+))?$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)-(block|inline)-<num>' },
	],
	[
		/^p-?([bi][se])(?:-(.+))?$/,
		directionSize('padding', 'PADDING'),
		{ autocomplete: '(m|p)-(bs|be|is|ie)-<num>' },
	],

	[/^m$/, directionSize('margin', 'MARGIN')],
	[/^ma?()-(.+)$/, directionSize('margin', 'MARGIN')],
	[/^m-xy()()$/, directionSize('margin', 'MARGIN')],
	[/^m-?([xy])(?:-(.+))?$/, directionSize('margin', 'MARGIN')],
	[/^m-?([rltbse])(?:-(.+))?$/, directionSize('margin', 'MARGIN')],
	[/^m-(block|inline)(?:-(.+))?$/, directionSize('margin', 'MARGIN')],
	[/^m-?([bi][se])(?:-(.+))?$/, directionSize('margin', 'MARGIN')],

	[/^gap$/, directionSize('gap', 'GAP')],
	[/^gap-(.+)$/, directionSize('gap', 'GAP'), { autocomplete: 'gap-$spacing' }],
];
