import { CalcInterpolation, Css } from '@arbor-css/calc';
import { createFunction } from '@arbor-css/functions';
import { $systemProps } from '@arbor-css/globals';

function lightDarkAlterations(
	css: Css,
	{
		light,
		dark,
		step,
	}: {
		light: number;
		dark: number;
		step: CalcInterpolation;
	},
) {
	return css`calc(1 + ${step} * (${[$systemProps.scheme.whenLight, 1]} * ${light}) + (${[$systemProps.scheme.whenDark, 1]} * ${dark}))`;
}

export const lightenColor = createFunction('lighten-color', {
	description: 'Lightens a color by a specified "step" value',
	parameters: ['--color', '--step'] as const,
	definition: (css, color, step) =>
		// l = (1 + (scheme(light) * 0.02 + scheme(dark) * -0.07) * step) * l
		// c = (1 + (scheme(light) * -0.1 + scheme(dark) * -0.03) * step) * c
		css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, { light: 0.02, dark: -0.07, step })}) calc(c * ${lightDarkAlterations(css, { light: -0.1, dark: -0.03, step })}) h)`,
});

export const darkenColor = createFunction('darken-color', {
	description: 'Darkens a color by a specified "step" value',
	parameters: ['--color', '--step'] as const,
	definition: (css, color, step) =>
		// l = (1 + (scheme(light) * -0.02 + scheme(dark) * 0.12) * step) * l
		// c = (1 + (scheme(light) * 0.01 + scheme(dark) * -0.09) * step) * c
		css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, { light: -0.02, dark: 0.12, step })}) calc(c * ${lightDarkAlterations(css, { light: 0.01, dark: -0.09, step })}) h)`,
});

export const desaturateColor = createFunction('desaturate-color', {
	description: 'Desaturates a color by a specified "step" value',
	parameters: ['--color', '--step'] as const,
	definition: (css, color, step) =>
		css`oklch(from ${color} l calc(c * (1 + ${[$systemProps.scheme.whenLight, 1]} * 0.05 * ${step})) h)`,
});

export const saturateColor = createFunction('saturate-color', {
	description: 'Saturates a color by a specified "step" value',
	parameters: ['--color', '--step'] as const,
	definition: (css, color, step) =>
		css`oklch(from ${color} l calc(c * (1 + ${[$systemProps.scheme.whenLight, 1]} * -0.05 * ${step})) h)`,
});

export const presetFunctions = {
	lightenColor,
	darkenColor,
	desaturateColor,
	saturateColor,
} as const;

export type BuiltinFunctions = typeof presetFunctions;
