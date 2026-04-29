import { $systemProps } from '@arbor-css/core';
import { parseColor } from '@unocss/preset-wind4/utils';
import { Rule, symbols } from 'unocss';

export function lighten(base: string, level: string) {
	return mod(base, parseInt(level, 10), 1);
}

export function darken(base: string, level: string) {
	return mod(base, parseInt(level, 10), -1);
}

function mod(base: string, level: number, sign: number) {
	// TODO: not hardcode white/black... figure out how to interpret these
	// with schemes/modes
	return `color-mix(in oklch, ${base} ${50 + level * sign * 10}%, ${sign === 1 ? 'white' : 'black'})`;
}

function parseColorWithSuffix(input: string, suffixes: string[], theme: any) {
	let attempt = parseColor(input, theme);
	if (attempt?.color) {
		return attempt;
	}
	for (const suffix of suffixes) {
		attempt = parseColor(`${input}-${suffix}`, theme);
		if (attempt?.color) {
			return attempt;
		}
	}
	return null;
}

export const colorRules: Rule[] = [
	[
		/^(?:color|c)-(.*)$/,
		(match, { theme }) => {
			if (match[1] === 'inherit') {
				return {
					color: $systemProps.fg.applied.var,
					[$systemProps.fg.applied.name]: 'unset',
				};
			}
			const parsed = parseColorWithSuffix(
				match[1],
				['color', 'c', 'fg'],
				theme,
			);
			if (!parsed?.color) {
				return undefined;
			}
			return {
				color:
					parsed.opacity ?
						`rgb(from ${$systemProps.fg.applied.var} r g b / ${$systemProps.fg.opacity.var})`
					:	$systemProps.fg.applied.var,
				[$systemProps.fg.applied.name]: parsed.color,
				[$systemProps.fg.opacity.name]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `color-$colors`,
		},
	],
	[
		/^color-l(?:ighten)?-(\d+\.?\d*)$/,
		(match) => ({
			color: lighten(
				$systemProps.fg.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'color-(l|lighten)-<number>',
		},
	],
	[
		/^color-d(?:arken)?-(\d+\.?\d*)$/,
		(match) => ({
			color: darken(
				$systemProps.fg.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'color-(d|darken)-<number>',
		},
	],
	[
		/^bg-(.*)$/,
		(match, ctx) => {
			const { theme } = ctx;
			if (match[1] === 'inherit') {
				return {
					'background-color': `rgb(from ${$systemProps.bg.applied.var} r g b / ${$systemProps.bg.opacity.var})`,
					[$systemProps.bg.applied.name]: 'unset',
				};
			}
			if (match[1] === 'transparent') {
				return {
					'background-color': 'transparent',
					[$systemProps.bg.applied.name]: 'unset',
				};
			}
			const parsed = parseColorWithSuffix(
				match[1],
				['bg', 'background'],
				theme,
			);
			if (!parsed?.color) {
				return undefined;
			}

			const base = {
				'background-color':
					parsed.opacity ?
						`rgb(from ${$systemProps.bg.applied.var} r g b / ${$systemProps.bg.opacity.var})`
					:	$systemProps.bg.applied.var,
				[$systemProps.bg.applied.name]: parsed.color,
				[$systemProps.bg.opacity.name]: (parsed.opacity || 100) + '%',
			};

			return base;
		},
		{
			autocomplete: `bg-$colors`,
		},
	],
	[
		/^bg-l(?:ighten)?-(\d+\.?\d*)$/,
		(match) => ({
			'background-color': lighten(
				$systemProps.bg.applied.varFallback(`white`),
				match[1],
			),
		}),
		{
			autocomplete: 'bg-(l|lighten)-<number>',
		},
	],
	[
		/^bg-d(?:arken)?-(\d+\.?\d*)$/,
		(match) => ({
			'background-color': darken(
				$systemProps.bg.applied.varFallback(`white`),
				match[1],
			),
		}),
		{
			autocomplete: 'bg-(d|darken)-<number>',
		},
	],
	[
		/^(?:border|b)-(.*)$/,
		(match, { theme }) => {
			if (match[1] === 'none') {
				return undefined;
			}
			const parsed = parseColorWithSuffix(match[1], ['border', 'b'], theme);
			if (!parsed?.color) {
				return undefined;
			}
			const thisColor =
				parsed.opacity ?
					`rgb(from ${$systemProps.borderColor.all.applied.var} r g b / ${$systemProps.borderColor.all.opacity.var})`
				:	$systemProps.borderColor.all.applied.var;
			return {
				'border-right-color':
					$systemProps.borderColor.right.applied.varFallback(thisColor),
				'border-bottom-color':
					$systemProps.borderColor.bottom.applied.varFallback(thisColor),
				'border-left-color':
					$systemProps.borderColor.left.applied.varFallback(thisColor),
				'border-top-color':
					$systemProps.borderColor.top.applied.varFallback(thisColor),
				[$systemProps.borderColor.all.applied.name]: parsed.color,
				[$systemProps.borderColor.all.opacity.name]:
					(parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `(border|b)-$colors`,
		},
	],
	[
		/^(?:border|b)-l(?:ighten)?-(\d+\.?\d*)$/,
		(match) => ({
			'border-color': lighten(
				$systemProps.borderColor.top.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: '(border|b)-l(?:ighten)?-<number>',
		},
	],
	[
		/^(?:border|b)-d(?:arken)?-(\d+\.?\d*)$/,
		(match) => ({
			'border-color': darken(
				$systemProps.borderColor.top.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: '(border|b)-(d|darken)-<number>',
		},
	],
	...(<const>['RIGHT', 'LEFT', 'TOP', 'BOTTOM']).flatMap((DIR) => {
		const shorthand = DIR.toLowerCase() as 'left' | 'right' | 'top' | 'bottom';
		return [
			[
				new RegExp(`^(?:border-|b-)${shorthand}-(.*)$`),
				(match, { theme }) => {
					if (match[1] === 'none') {
						return undefined;
					}
					const parsed = parseColor(match[1], theme);
					if (!parsed?.color) {
						return undefined;
					}
					const thisColor =
						parsed.opacity ?
							`rgb(from ${$systemProps.borderColor[shorthand].applied.var} r g b / var(${$systemProps.borderColor[shorthand].opacity.var},100%))`
						:	`var(${$systemProps.borderColor[shorthand].applied.var},var(${$systemProps.borderColor[shorthand].applied.var}))`;
					return {
						[`border-${dirnames[DIR]}-color`]: thisColor,
						[`${$systemProps.borderColor[shorthand].applied.name}`]:
							parsed.color,
						[`${$systemProps.borderColor[shorthand].opacity.name}`]:
							(parsed.opacity || 100) + '%',
					};
				},
				{
					autocomplete: `b-${shorthand}-$colors`,
				},
			],
			[
				new RegExp(`^(?:border|b)-${shorthand}-l(?:ighten)?-(\\d+\\.?\\d*)$`),
				(match) => ({
					[`border-${shorthand}-color`]: lighten(
						`var(${$systemProps.borderColor[shorthand].applied.name},currentColor)`,
						match[1],
					),
				}),
				{
					autocomplete: `(border|b)-${shorthand}-(l|lighten)-<number>`,
				},
			],
			[
				new RegExp(`^(?:border|b)-${shorthand}-d(?:arken)?-(\\d+\\.?\\d*)$`),
				(match) => ({
					[`border-${shorthand}-color`]: darken(
						`var(${$systemProps.borderColor[shorthand].applied.name},currentColor)`,
						match[1],
					),
				}),
				{
					autocomplete: `(border|b)-${shorthand}-(d|darken)-<number>`,
				},
			],
		] as Rule[];
	}),
	[
		/^ring-(.*)$/,
		(match, { theme }) => {
			const parsed = parseColorWithSuffix(match[1], ['ring', 'r'], theme);
			if (!parsed?.color) {
				return undefined;
			}
			return {
				[$systemProps.ring.target.name]:
					parsed.opacity ?
						`rgb(from ${$systemProps.ring.applied.var} r g b / var(${$systemProps.ring.opacity.var},100%))`
					:	$systemProps.ring.applied.var,
				[$systemProps.ring.applied.name]: parsed.color,
				[$systemProps.ring.opacity.name]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `ring-$colors`,
		},
	],
	[
		/^ring-l(:?ighten)?-(\d+\.?\d*)$/,
		(match) => ({
			[$systemProps.ring.target.name]: lighten(
				$systemProps.ring.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'ring-(l|lighten)-<number>',
		},
	],
	[
		/^ring-d(?:arken)?-(\d+\.?\d*)$/,
		(match) => ({
			[$systemProps.ring.target.name]: darken(
				$systemProps.ring.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'ring-(d|darken)-<number>',
		},
	],
	[
		/^placeholder-(.*)$/,
		function* (match, { theme }) {
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return;
			}
			yield {
				[symbols.selector]: (selector) => `${selector}::placeholder`,
				color:
					parsed.opacity ?
						`rgb(from ${$systemProps.placeholder.applied.var} r g b / var(${$systemProps.placeholder.opacity.var},100%))`
					:	$systemProps.placeholder.applied.var,
				[$systemProps.placeholder.applied.name]: parsed.color,
				[$systemProps.placeholder.opacity.name]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `placeholder-$colors`,
		},
	],
	[
		/^placeholder-l(?:ighten)?-(\d+\.?\d*)$/,
		function* (match) {
			yield {
				[symbols.selector]: (selector) => `${selector}::placeholder`,
				color: lighten(
					$systemProps.placeholder.applied.varFallback('currentColor'),
					match[1],
				),
			};
		},
		{
			autocomplete: 'placeholder-(l|lighten)-<number>',
		},
	],
	[
		/^placeholder-d(?:arken)?-(\d+\.?\d*)$/,
		function* (match) {
			yield {
				[symbols.selector]: (selector) => `${selector}::placeholder`,
				color: darken(
					$systemProps.placeholder.applied.varFallback('currentColor'),
					match[1],
				),
			};
		},
		{
			autocomplete: 'placeholder-(d|darken)-<number>',
		},
	],
	[
		/^accent-(.*)$/,
		(match, { theme }) => {
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return undefined;
			}
			return {
				'accent-color':
					parsed.opacity ?
						`rgb(from ${$systemProps.accent.applied.var} r g b / var(${$systemProps.accent.opacity.var},100%))`
					:	$systemProps.accent.applied.var,
				[$systemProps.accent.applied.name]: parsed.color,
				[$systemProps.accent.opacity.name]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `accent-$colors`,
		},
	],
	[
		/^accent-l(?:ighten)?-(\d+\.?\d*)$/,
		(match) => ({
			'accent-color': lighten(
				$systemProps.accent.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'accent-(l|lighten)-<number>',
		},
	],
	[
		/^accent-d(?:arken)?-(\d+\.?\d*)$/,
		(match) => ({
			'accent-color': darken(
				$systemProps.accent.applied.varFallback('currentColor'),
				match[1],
			),
		}),
		{
			autocomplete: 'accent-(d|darken)-<number>',
		},
	],
];

const dirnames: Record<string, string> = {
	RIGHT: 'right',
	LEFT: 'left',
	TOP: 'top',
	BOTTOM: 'bottom',
};
