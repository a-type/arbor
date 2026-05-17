import { Css } from '@arbor-css/calc';
import { createFunction } from '@arbor-css/functions';
import { $systemProps } from '@arbor-css/globals';
import { createToken, Token } from '@arbor-css/tokens';

function lightDarkAlterations(
	css: Css,
	{
		light,
		dark,
		step,
	}: {
		light: number;
		dark: number;
		step: Token;
	},
) {
	return css`calc(1 + ${step} * (${[$systemProps.scheme.whenLight, 1]} * ${light}) + (${[$systemProps.scheme.whenDark, 1]} * ${dark}))`;
}

export const lightenColor = createFunction('lighten-color', {
	description: 'Lightens a color by a specified "step" value',
	parameters: [
		createToken('color', { type: 'color' }),
		createToken('step', { type: 'number' }),
	],
	definition: (css, color, step) =>
		// l = (1 + (scheme(light) * 0.02 + scheme(dark) * -0.07) * step) * l
		// c = (1 + (scheme(light) * -0.1 + scheme(dark) * -0.03) * step) * c
		css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, { light: 0.02, dark: -0.07, step })}) calc(c * ${lightDarkAlterations(css, { light: -0.1, dark: -0.03, step })}) h)`,
});

export const darkenColor = createFunction('darken-color', {
	description: 'Darkens a color by a specified "step" value',
	parameters: [
		createToken('color', { type: 'color' }),
		createToken('step', { type: 'number' }),
	],
	definition: (css, color, step) =>
		// l = (1 + (scheme(light) * -0.02 + scheme(dark) * 0.12) * step) * l
		// c = (1 + (scheme(light) * 0.01 + scheme(dark) * -0.09) * step) * c
		css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, { light: -0.02, dark: 0.12, step })}) calc(c * ${lightDarkAlterations(css, { light: 0.01, dark: -0.09, step })}) h)`,
});

export const presetFunctions = [lightenColor, darkenColor];
