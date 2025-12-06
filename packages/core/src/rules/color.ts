import { parseColor } from '@unocss/preset-wind4/utils';
import { Rule } from 'unocss';
import { PROPS } from '../constants/properties.js';
import { darken, lighten } from '../logic/color.js';

export const colorRules: Rule[] = [
	[
		/^color-(.*)$/,
		(match, { theme }) => {
			if (match[1] === 'inherit') {
				return {
					color: `var(${PROPS.COLOR.FINAL},var(${PROPS.COLOR.INHERITED}))`,
					[PROPS.COLOR.INHERITED]: 'unset',
				};
			}
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return undefined;
			}
			return {
				color: parsed.opacity
					? `rgb(from var(${PROPS.COLOR.FINAL},var(${PROPS.COLOR.INHERITED})) r g b / var(${PROPS.COLOR.OPACITY},100%))`
					: `var(${PROPS.COLOR.FINAL},var(${PROPS.COLOR.INHERITED}))`,
				[PROPS.COLOR.INHERITED]: parsed.color,
				[PROPS.COLOR.OPACITY]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `color-$colors`,
		},
	],
	[
		/^color-lighten-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.COLOR.FINAL]: lighten(
				`var(${PROPS.COLOR.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'color-lighten-<number>',
		},
	],
	[
		/^color-darken-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.COLOR.FINAL]: darken(
				`var(${PROPS.COLOR.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'color-darken-<number>',
		},
	],
	[
		/^bg-(.*)$/,
		(match, ctx) => {
			const { theme } = ctx;
			if (match[1] === 'inherit') {
				return {
					'background-color': `rgb(from var(${PROPS.BACKGROUND_COLOR.FINAL},var(${PROPS.BACKGROUND_COLOR.INHERITED})) r g b / var(${PROPS.BACKGROUND_COLOR.OPACITY},100%))`,
					[PROPS.BACKGROUND_COLOR.INHERITED]: 'unset',
				};
			}
			if (match[1] === 'transparent') {
				return {
					'background-color': 'transparent',
					[PROPS.BACKGROUND_COLOR.INHERITED]: 'unset',
				};
			}
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return undefined;
			}

			const base = {
				'background-color': parsed.opacity
					? `rgb(from var(${PROPS.BACKGROUND_COLOR.FINAL},var(${PROPS.BACKGROUND_COLOR.INHERITED})) r g b / var(${PROPS.BACKGROUND_COLOR.OPACITY},100%))`
					: `var(${PROPS.BACKGROUND_COLOR.FINAL},var(${PROPS.BACKGROUND_COLOR.INHERITED}))`,
				[PROPS.BACKGROUND_COLOR.INHERITED]: parsed.color,
				[PROPS.BACKGROUND_COLOR.OPACITY]: (parsed.opacity || 100) + '%',
			};

			return base;
		},
		{
			autocomplete: `bg-$colors`,
		},
	],
	[
		/^bg-lighten-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.BACKGROUND_COLOR.FINAL]: lighten(
				`var(${PROPS.BACKGROUND_COLOR.INHERITED},var(${PROPS.MODE.WHITE}))`,
				match[1],
			),
		}),
		{
			autocomplete: 'bg-lighten-<number>',
		},
	],
	[
		/^bg-darken-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.BACKGROUND_COLOR.FINAL]: darken(
				`var(${PROPS.BACKGROUND_COLOR.INHERITED},var(${PROPS.MODE.WHITE}))`,
				match[1],
			),
		}),
		{
			autocomplete: 'bg-darken-<number>',
		},
	],
	[
		/^border-(.*)$/,
		(match, { theme }) => {
			if (match[1] === 'none') {
				return undefined;
			}
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return undefined;
			}
			const thisColor = parsed.opacity
				? `rgb(from var(${PROPS.BORDER_COLOR.ALL.FINAL},var(${PROPS.BORDER_COLOR.ALL.INHERITED})) r g b / var(${PROPS.BORDER_COLOR.ALL.OPACITY},100%))`
				: `var(${PROPS.BORDER_COLOR.ALL.FINAL},var(${PROPS.BORDER_COLOR.ALL.INHERITED}))`;
			return {
				'border-right-color': `var(${PROPS.BORDER_COLOR.RIGHT.FINAL},var(${PROPS.BORDER_COLOR.RIGHT.INHERITED},${thisColor}))`,
				'border-bottom-color': `var(${PROPS.BORDER_COLOR.BOTTOM.FINAL},var(${PROPS.BORDER_COLOR.BOTTOM.INHERITED},${thisColor}))`,
				'border-left-color': `var(${PROPS.BORDER_COLOR.LEFT.FINAL},var(${PROPS.BORDER_COLOR.LEFT.INHERITED},${thisColor}))`,
				'border-top-color': `var(${PROPS.BORDER_COLOR.TOP.FINAL},var(${PROPS.BORDER_COLOR.TOP.INHERITED},${thisColor}))`,
				[PROPS.BORDER_COLOR.ALL.INHERITED]: parsed.color,
				[PROPS.BORDER_COLOR.ALL.OPACITY]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `border-$colors`,
		},
	],
	[
		/^border-lighten-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.BORDER_COLOR.ALL.FINAL]: lighten(
				`var(${PROPS.BORDER_COLOR.ALL.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'border-lighten-<number>',
		},
	],
	[
		/^border-darken-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.BORDER_COLOR.ALL.FINAL]: darken(
				`var(${PROPS.BORDER_COLOR.ALL.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'border-darken-<number>',
		},
	],
	...(<const>['RIGHT', 'LEFT', 'TOP', 'BOTTOM']).flatMap((DIR) => {
		const shorthand = DIR[0].toLowerCase();
		return [
			[
				new RegExp(`^border-${shorthand}-(.*)$`),
				(match, { theme }) => {
					if (match[1] === 'none') {
						return undefined;
					}
					const parsed = parseColor(match[1], theme);
					if (!parsed?.color) {
						return undefined;
					}
					const thisColor = parsed.opacity
						? `rgb(from var(${PROPS.BORDER_COLOR[DIR].FINAL},var(${PROPS.BORDER_COLOR[DIR].INHERITED})) r g b / var(${PROPS.BORDER_COLOR[DIR].OPACITY},100%))`
						: `var(${PROPS.BORDER_COLOR[DIR].FINAL},var(${PROPS.BORDER_COLOR[DIR].INHERITED}))`;
					return {
						[`border-${dirnames[DIR]}-color`]: thisColor,
						[`${PROPS.BORDER_COLOR[DIR].INHERITED}`]: parsed.color,
						[`${PROPS.BORDER_COLOR[DIR].OPACITY}`]:
							(parsed.opacity || 100) + '%',
					};
				},
				{
					autocomplete: `border-${shorthand}-$colors`,
				},
			],
			[
				new RegExp(`^border-${shorthand}-lighten-(\\d+\\.?\\d*)$`),
				(match) => ({
					[`${PROPS.BORDER_COLOR[DIR].FINAL}`]: lighten(
						`var(${PROPS.BORDER_COLOR[DIR].INHERITED},currentColor)`,
						match[1],
					),
				}),
				{
					autocomplete: `border-${shorthand}-lighten-<number>`,
				},
			],
			[
				new RegExp(`^border-${shorthand}-darken-(\\d+\\.?\\d*)$`),
				(match) => ({
					[`${PROPS.BORDER_COLOR[DIR].FINAL}`]: darken(
						`var(${PROPS.BORDER_COLOR[DIR].INHERITED},currentColor)`,
						match[1],
					),
				}),
				{
					autocomplete: `border-${shorthand}-darken-<number>`,
				},
			],
		] as Rule[];
	}),
	[
		/^ring-(.*)$/,
		(match, { theme }) => {
			const parsed = parseColor(match[1], theme);
			if (!parsed?.color) {
				return undefined;
			}
			return {
				[PROPS.BUILT_IN.RING_COLOR]: parsed.opacity
					? `rgb(from var(${PROPS.RING_COLOR.FINAL},var(${PROPS.RING_COLOR.INHERITED})) r g b / var(${PROPS.RING_COLOR.OPACITY},100%))`
					: `var(${PROPS.RING_COLOR.FINAL},var(${PROPS.RING_COLOR.INHERITED}))`,
				[PROPS.RING_COLOR.INHERITED]: parsed.color,
				[PROPS.RING_COLOR.OPACITY]: (parsed.opacity || 100) + '%',
			};
		},
		{
			autocomplete: `ring-$colors`,
		},
	],
	[
		/^ring-lighten-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.RING_COLOR.FINAL]: lighten(
				`var(${PROPS.RING_COLOR.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'ring-lighten-<number>',
		},
	],
	[
		/^ring-darken-(\d+\.?\d*)$/,
		(match) => ({
			[PROPS.RING_COLOR.FINAL]: darken(
				`var(${PROPS.RING_COLOR.INHERITED},currentColor)`,
				match[1],
			),
		}),
		{
			autocomplete: 'ring-darken-<number>',
		},
	],
];

const dirnames: Record<string, string> = {
	RIGHT: 'right',
	LEFT: 'left',
	TOP: 'top',
	BOTTOM: 'bottom',
};
