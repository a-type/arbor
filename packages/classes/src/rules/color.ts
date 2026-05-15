import { getContrastColor } from '@arbor-css/colors';
import { $systemProps, resolveTokenReferences } from '@arbor-css/core';
import { Rule, symbols } from 'unocss';
import { Theme } from '../theme/types.js';
import { colorAlters, colorAltersMatch } from '../util/alters.js';
import { parseColor } from '../util/color.js';
import { customPropertyRe } from '../util/regex.js';
import { isNumericLiteral, isNumericUnitLiteral } from '../util/tests.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

export const laterals = {
	fg: $systemProps.fg.final.varFallback(
		$systemProps.fg.applied.varFallback('currentColor'),
	),
	bg: $systemProps.bg.final.varFallback(
		$systemProps.bg.applied.varFallback($systemProps.scheme.trueLight.var),
	),
	fill: $systemProps.fill.final.varFallback(
		$systemProps.fill.applied.varFallback('currentColor'),
	),
	stroke: $systemProps.stroke.final.varFallback(
		$systemProps.stroke.applied.varFallback('currentColor'),
	),
	accent: $systemProps.accent.final.varFallback(
		$systemProps.accent.applied.varFallback('currentColor'),
	),
	ring: $systemProps.ring.final.varFallback(
		$systemProps.ring.applied.varFallback('currentColor'),
	),
	shadow: $systemProps.dynamic.shadowColor.varFallback('currentColor'),
};

function makeColorSystemRules({
	target,
	shorthands,
	systemProp,
	suffixes,
}: {
	target: string;
	shorthands: string[];
	systemProp:
		| 'fg'
		| 'bg'
		| 'fill'
		| 'stroke'
		| 'accent'
		| 'ring'
		| 'ringOffset'
		| 'shadow';
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

				let [value, { source }] = themeOrLiteral(baseColor, theme, {
					startFrom: 'color',
					trySuffixes: suffixes,
					type: 'color',
				});
				if (!value) {
					if (baseColor in laterals) {
						value = laterals[baseColor as keyof typeof laterals];
					} else {
						return;
					}
				}
				if (isNumericLiteral(value) || isNumericUnitLiteral(value)) {
					// probably not meant for us...
					return;
				}
				const restoredOpacity = opacityPart ? `${value}/${opacityPart}` : value;
				const parsed = parseColor(restoredOpacity);
				if (!parsed) return;

				let comment = '';
				if (source === 'theme') {
					// try adding an evaluated color comment to the end
					const preset = theme.meta.preset;
					const matchedPropertyName = customPropertyRe.exec(value)?.[1];
					if (preset && matchedPropertyName) {
						const resolved = resolveTokenReferences(
							preset,
							matchedPropertyName,
						);
						if (resolved) {
							comment = ` /* ${resolved} */`;
						}
					}
				}

				const result = {
					[target]:
						parsed.opacity ?
							`rgb(from ${$systemProps[systemProp].final.var} r g b / ${$systemProps[systemProp].opacity.var})`
						:	$systemProps[systemProp].final.var,
					[$systemProps[systemProp].applied.name]:
						parsed.color === 'inherit' ? 'unset' : parsed.color + comment,
					[$systemProps[systemProp].final.name]:
						$systemProps[systemProp].applied.var,
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
					[$systemProps[systemProp].final.name]: color,
				};

				if (systemProp === 'bg') {
					result[$systemProps.bg.contrast.name] = color;
				}

				return result;
			},
			{
				autocomplete: `(${shorthands.join('|')})-${colorAltersMatch}-<number>`,
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
	...makeColorSystemRules({
		target: $systemProps.ringOffset.target.name,
		shorthands: ['ring-offset'],
		suffixes: ['ring-offset', 'color'],
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
			autocomplete: `placeholder-${colorAltersMatch}-<number>`,
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
