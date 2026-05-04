import { $systemProps } from '@arbor-css/core';
import { Rule, symbols } from 'unocss';
import { Theme } from '../theme/types.js';
import {
	colorAlters,
	colorAltersMatch,
	parseColor,
	themeOrLiteral,
} from './_util.js';

function makeColorSystemRules({
	target,
	shorthands,
	systemProp,
}: {
	target: string;
	shorthands: string[];
	systemProp: 'fg' | 'bg' | 'fill' | 'stroke' | 'accent' | 'ring';
}): Rule<Theme>[] {
	return [
		[
			new RegExp(`^(?:${shorthands.join('|')})-(.*)$`),
			([, color], { theme }) => {
				const [value] = themeOrLiteral(color, theme, {
					startFrom: 'color',
					trySuffixes: ['color', 'c', 'fg'],
				});
				const parsed = parseColor(value);
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
						parsed.color === 'inherit' ? 'unset' : parsed.color;
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
		systemProp: 'fg',
	}),
	...makeColorSystemRules({
		target: 'background-color',
		shorthands: ['bg'],
		systemProp: 'bg',
	}),
	...makeColorSystemRules({
		target: 'accent-color',
		shorthands: ['accent'],
		systemProp: 'accent',
	}),
	...makeColorSystemRules({
		target: 'fill',
		shorthands: ['fill'],
		systemProp: 'fill',
	}),
	...makeColorSystemRules({
		target: 'stroke',
		shorthands: ['stroke'],
		systemProp: 'stroke',
	}),
	...makeColorSystemRules({
		target: $systemProps.ring.target.name,
		shorthands: ['ring'],
		systemProp: 'ring',
	}),
	// placeholder requires special handling for the pseudo-element
	[
		/^placeholder-(.*)$/,
		function* (match, { theme }) {
			const [value] = themeOrLiteral(match[1], theme, {
				startFrom: 'color',
				trySuffixes: ['placeholder', 'color'],
			});
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
];
