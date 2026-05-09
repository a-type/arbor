import { getContrastColor } from '@arbor-css/colors';
import { $systemProps } from '@arbor-css/core';
import { Rule, symbols } from 'unocss';
import { Theme } from '../theme/types.js';
import { colorAlters, colorAltersMatch } from '../util/alters.js';
import { parseColor } from '../util/color.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

function makeColorSystemRules({
	target,
	shorthands,
	systemProp,
	suffixes,
}: {
	target: string;
	shorthands: string[];
	systemProp: 'fg' | 'bg' | 'fill' | 'stroke' | 'accent' | 'ring' | 'shadow';
	suffixes?: string[];
}): Rule<Theme>[] {
	return [
		[
			new RegExp(`^(?:${shorthands.join('|')})-(.*)$`),
			([, color], { theme }) => {
				// pre-splitting opacity and restoring it later allows
				// supporting [color]/50 syntax while detecting the color portion
				const split = color.split('/');
				const baseColor = split[0];
				const opacityPart = split[1];
				const [value] = themeOrLiteral(baseColor, theme, {
					startFrom: 'color',
					trySuffixes: suffixes,
				});
				if (!value) return;
				const restoredOpacity = opacityPart ? `${value}/${opacityPart}` : value;
				const parsed = parseColor(restoredOpacity);
				if (!parsed) return;

				const result = {
					[target]:
						parsed.opacity ?
							`rgb(from ${$systemProps[systemProp].applied.var} r g b / ${$systemProps[systemProp].opacity.var})`
						:	$systemProps[systemProp].applied.var,
					[$systemProps[systemProp].applied.name]:
						parsed.color === 'inherit' ? 'unset' : parsed.color,
					[$systemProps[systemProp].opacity.name]: parsed.opacity || '1',
				};

				if (systemProp === 'bg') {
					result[$systemProps.bg.contrast.name] =
						parsed.color === 'inherit' || parsed.color === 'transparent' ?
							'unset'
						:	parsed.color;
				}

				return result;
			},
			{
				autocomplete: `(${shorthands.join('|')}-$color`,
			},
		],
		[
			new RegExp(`^(?:${shorthands.join('|')})-${colorAltersMatch}-(\\d+)$`),
			([, method, step]) => {
				const color = colorAlters[method](
					$systemProps[systemProp].applied.varFallback('currentColor'),
					step,
				);
				const result = {
					[target]: color,
				};

				if (systemProp === 'bg') {
					result[$systemProps.bg.contrast.name] = color;
				}

				return result;
			},
			{
				autocomplete: `(${shorthands.join('|')})-(l|lighten|d|darken)-<number>`,
			},
		],
	];
}

export const colorRules: Rule<Theme>[] = [
	...makeColorSystemRules({
		target: 'color',
		shorthands: ['color', 'c', 'fg'],
		suffixes: ['color', 'fg'],
		systemProp: 'fg',
	}),
	...makeColorSystemRules({
		target: 'background-color',
		shorthands: ['bg'],
		suffixes: ['background', 'background-color', 'bg'],
		systemProp: 'bg',
	}),
	...makeColorSystemRules({
		target: 'accent-color',
		shorthands: ['accent'],
		suffixes: ['accent', 'color'],
		systemProp: 'accent',
	}),
	...makeColorSystemRules({
		target: 'fill',
		shorthands: ['fill'],
		suffixes: ['fill', 'bg', 'color', 'fg', 'background', 'background-color'],
		systemProp: 'fill',
	}),
	...makeColorSystemRules({
		target: 'stroke',
		shorthands: ['stroke'],
		suffixes: ['stroke', 'color'],
		systemProp: 'stroke',
	}),
	...makeColorSystemRules({
		target: $systemProps.ring.target.name,
		shorthands: ['ring'],
		suffixes: ['ring', 'color'],
		systemProp: 'ring',
	}),
	...makeColorSystemRules({
		target: $systemProps.dynamic.shadowColor.name,
		shorthands: ['shadow', 'shadow-color'],
		suffixes: ['shadow', 'color', 'shadow-color'],
		systemProp: 'shadow',
	}),
	// placeholder requires special handling for the pseudo-element
	[
		/^placeholder-(.*)$/,
		function* (match, { theme }) {
			const [value] = themeOrLiteral(match[1], theme, {
				startFrom: 'color',
				trySuffixes: ['placeholder', 'color'],
			});
			if (!value) return;
			const parsed = parseColor(value);
			if (!parsed) return;
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
			autocomplete: `placeholder-$color`,
		},
	],
	[
		new RegExp(`/^placeholder-${colorAltersMatch}-(\d+\.?\d*)$/`),
		function* ([, method, step]) {
			yield {
				[symbols.selector]: (selector) => `${selector}::placeholder`,
				color: colorAlters[method](
					$systemProps.placeholder.applied.varFallback('currentColor'),
					step,
				),
			};
		},
		{
			autocomplete: 'placeholder-(l|lighten|d|darken)-<number>',
		},
	],

	// color-contrast: "magic" rule which uses the contrast bg system color
	// to compute a valid foreground
	[
		/^color-contrast$/,
		() => {
			return {
				color: getContrastColor($systemProps.bg.contrast.varFallback('white')),
				[$systemProps.fg.applied.name]: getContrastColor(
					$systemProps.bg.contrast.varFallback('white'),
				),
			};
		},
	],
];
