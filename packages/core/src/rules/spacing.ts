import { Theme } from '@unocss/preset-mini';
import { directionMap, h } from '@unocss/preset-mini/utils';
import {
	CSSEntries,
	CSSEntry,
	DynamicMatcher,
	Rule,
	RuleContext,
} from 'unocss';
import { PROPS } from '../constants/properties';

function directionSize(
	propertyPrefix: string,
	sysProp: string = '--none',
): DynamicMatcher {
	return (
		[_, direction, size]: string[],
		{ theme }: RuleContext<Theme>,
	): CSSEntries | undefined => {
		const v =
			theme.spacing?.[size || 'DEFAULT'] ??
			h.bracket.cssvar.global.auto.fraction.rem(size);

		if (v != null) {
			return [
				[sysProp, v] satisfies CSSEntry,
				...directionMap[direction].map(
					(i) => [`${propertyPrefix}${i}`, v] satisfies CSSEntry,
				),
			].filter((e) => !!e[0]);
		} else if (size?.startsWith('-')) {
			// --custom-spacing-value
			const v = theme.spacing?.[size.slice(1)];
			if (v != null)
				return [
					[sysProp, `calc(${v} * -1)`] satisfies CSSEntry,
					...directionMap[direction].map(
						(i) =>
							[`${propertyPrefix}${i}`, `calc(${v} * -1)`] satisfies CSSEntry,
					),
				].filter((e) => !!e[0]);
		}
	};
}

export const spacingRules: Rule[] = [
	[
		/^pa?()-?(.+)$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: ['(m|p)<num>', '(m|p)-<num>'] },
	],
	[
		/^p-?xy()()$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(xy)' },
	],
	[
		/^p-?([xy])(?:-?(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(x|y)-<num>' },
	],
	[
		/^p-?([rltbse])(?:-?(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)<directions>-<num>' },
	],
	[
		/^p-(block|inline)(?:-(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(block|inline)-<num>' },
	],
	[
		/^p-?([bi][se])(?:-?(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(bs|be|is|ie)-<num>' },
	],

	[/^ma?()-?(.+)$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?xy()()$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([xy])(?:-?(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([rltbse])(?:-?(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-(block|inline)(?:-(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([bi][se])(?:-?(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
];
