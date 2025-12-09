import { Theme } from '@unocss/preset-mini';
import { directionMap, h } from '@unocss/preset-mini/utils';
import { DynamicMatcher, Rule, RuleContext } from 'unocss';
import { PROPS } from '../constants/properties';
import { SELECTORS } from '../constants/selectors';

function directionSize(
	propertyPrefix: string,
	sysProps = PROPS.GROUP.PADDING,
): DynamicMatcher {
	if (
		!sysProps.FINAL ||
		!sysProps.ODD ||
		!sysProps.EVEN ||
		!sysProps.INHERITED
	) {
		throw new Error(
			`Invalid system properties for spacing rule: ${JSON.stringify(sysProps)}`,
		);
	}
	return function* (
		[_, directionOrSize, maybeSize]: string[],
		{ theme, symbols }: RuleContext<Theme>,
	) {
		let direction: string = '';
		let size = maybeSize ? maybeSize : directionOrSize;
		if (maybeSize) {
			direction = directionOrSize;
		}
		let v =
			theme.spacing?.[size || 'DEFAULT'] ??
			h.bracket.cssvar.global.auto.fraction.rem(size);
		let negative = false;

		if (size?.startsWith('-')) {
			if (v === null) {
				v = theme.spacing?.[size.slice(1)];
			}
			v = `calc(${v} * -1)`;
			negative = true;
		}

		// local value
		yield {
			[sysProps.FINAL]: v,
			...Object.fromEntries(
				directionMap[direction].map((i) => [`${propertyPrefix}${i}`, v]),
			),
		};

		// provide group nesting values
		yield {
			[symbols.parent]: SELECTORS.GROUP_INITIAL,
			[sysProps.EVEN]: v,
			[sysProps.ODD]: v,
		};
		yield {
			[symbols.parent]: SELECTORS.GROUP_EVEN,
			[sysProps.EVEN]: v,
		};
		yield {
			[symbols.parent]: SELECTORS.GROUP_ODD,
			[sysProps.ODD]: v,
		};
	};
}

export const spacingRules: Rule[] = [
	[
		/^pa?()-(.+)$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)' },
	],
	[
		/^p-xy()()$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(xy)' },
	],
	[
		/^p-?([xy])(?:-(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(x|y)-<num>' },
	],
	[
		/^p-?([rltbse])(?:-(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)<directions>-<num>' },
	],
	[
		/^p-(block|inline)(?:-(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(block|inline)-<num>' },
	],
	[
		/^p-?([bi][se])(?:-(.+))?$/,
		directionSize('padding', PROPS.GROUP.PADDING),
		{ autocomplete: '(m|p)-(bs|be|is|ie)-<num>' },
	],

	[/^ma?()-(.+)$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-xy()()$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([xy])(?:-(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([rltbse])(?:-(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-(block|inline)(?:-(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
	[/^m-?([bi][se])(?:-(.+))?$/, directionSize('margin', PROPS.GROUP.MARGIN)],
];
