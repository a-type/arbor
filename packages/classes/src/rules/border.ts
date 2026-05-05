import { $systemProps } from '@arbor-css/core';
import { CSSObject, Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { colorAlters, colorAltersMatch } from '../util/alters.js';
import { parseColor } from '../util/color.js';
import { dashConcat } from '../util/concat.js';
import { directionMapEntries, globalKeywords } from '../util/mappings.js';
import { dirRegex } from '../util/matchers.js';
import { isNumericLiteral, isNumericUnitLiteral } from '../util/tests.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

const borderStyles = [
	'solid',
	'dashed',
	'dotted',
	'double',
	'hidden',
	'none',
	'groove',
	'ridge',
	'inset',
	'outset',
	...globalKeywords,
];

const borderWidthRules: Rule<Theme>[] = directionMapEntries.flatMap(
	([dirSuffix, dirs]) => {
		const pattern = `^(?:border|b)${dirRegex(dirSuffix)}-(.+)$`;
		return [
			[
				new RegExp(pattern),
				([, size], { theme }) => {
					const [value, { source }] = themeOrLiteral(size, theme, {
						startFrom: 'border-width',
						unitForLiteralNumber: 'px',
						trySuffixes: ['width', 'w'],
					});
					if (source === 'bracket') {
						// bracket values should be numeric values...
						if (!/^\d+(px|em|rem|%)$/.test(value)) {
							return;
						}
					}
					if (source === 'literal') {
						// bare literals must be numbers
						if (!isNumericUnitLiteral(size) && !isNumericLiteral(size)) {
							return;
						}
					}
					return Object.fromEntries(
						dirs.map((dir) => [`${dashConcat('border', dir)}-width`, value]),
					);
				},
			] satisfies Rule<Theme>,
		];
	},
);

const borderRadiusRules: Rule<Theme>[] = directionMapEntries.flatMap(
	([dirSuffix, dirs]) => {
		const pattern = `^(?:rounded|rd)${dirRegex(dirSuffix)}-(.+)$`;
		return [
			[
				new RegExp(pattern),
				([, size], { theme }) => {
					const [value] = themeOrLiteral(size, theme, {
						startFrom: 'border-radius',
						unitForLiteralNumber: 'px',
						trySuffixes: ['radius', 'r'],
					});
					return Object.fromEntries(
						dirs.map((dir) => [`${dashConcat('border', dir)}-radius`, value]),
					);
				},
			] satisfies Rule<Theme>,
		];
	},
);

const borderColorRules: Rule<Theme>[] = directionMapEntries.flatMap(
	([dirSuffix, dirs]) => {
		return [
			// Rule to apply a color
			[
				new RegExp(`^(?:border|b)${dirRegex(dirSuffix)}-(.+)$`),
				([, color], { theme }) => {
					const [value] = themeOrLiteral(color, theme, {
						startFrom: 'color',
						trySuffixes: ['color'],
					});
					const parsed = parseColor(value);
					if (!parsed) return;

					// Maps input color to a system prop associated with direction,
					// then applies that prop.

					return dirs.flatMap<CSSObject>((dir) => {
						const systemPropWithFallback = $systemProps.borderColor[
							dir
						].applied.varFallback($systemProps.borderColor[''].applied.var);
						const systemOpacityPropWithFallback = $systemProps.borderColor[
							dir
						].opacity.varFallback($systemProps.borderColor[''].opacity.var);
						const applied =
							parsed.opacity ?
								`rgb(from ${systemPropWithFallback} / ${systemOpacityPropWithFallback})`
							:	systemPropWithFallback;
						return {
							[`${dashConcat('border', dir)}-color`]: applied,
							[$systemProps.borderColor[dir].applied.name]: parsed.color,
							[$systemProps.borderColor[dir].opacity.name]:
								parsed.opacity || '1',
						} as CSSObject;
					});
				},
			],
			// lighten/darken rules
			[
				new RegExp(
					`^(?:border|b)${dirRegex(dirSuffix)}-${colorAltersMatch}-(.+)$`,
				),
				([, method, steps]) => {
					return dirs.flatMap<CSSObject>((dir) => ({
						[`${dashConcat('border', dir)}-color`]: colorAlters[method](
							$systemProps.borderColor[dir].applied.varFallback(
								$systemProps.borderColor[''].applied.var,
							),
							steps,
						),
					}));
				},
			],
		] satisfies Rule<Theme>[];
	},
);

const borderStyleRules: Rule<Theme>[] = directionMapEntries.flatMap(
	([dirSuffix, dirs]) => {
		return borderStyles.map((style) => {
			return [
				new RegExp(`^(?:border|b)${dirRegex(dirSuffix)}-${style}$`),
				([]) => {
					return Object.fromEntries(
						dirs.map((dir) => [`${dashConcat('border', dir)}-style`, style]),
					);
				},
			] satisfies Rule<Theme>;
		});
	},
);

export const borderRules: Rule<Theme>[] = [
	...borderColorRules,
	...borderWidthRules,
	...borderRadiusRules,
	...borderStyleRules,
];
