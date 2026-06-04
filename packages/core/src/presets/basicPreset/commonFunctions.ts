import { CalcInterpolation, Css } from '@arbor-css/calc';
import { Token } from '@arbor-css/tokens';

export type RequiredTokens = {
	whenLight: Token;
	whenDark: Token;
};

export function lightDarkAlteration(
	css: Css,
	tokens: RequiredTokens,
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
	return css`calc(1 + ${step} * (${[tokens.whenLight, 1]} * ${light}) + (${[tokens.whenDark, 1]} * ${dark}))`;
}

export function lightenColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} calc(l * ${lightDarkAlteration(css, tokens, { light: 0.04, dark: -0.17, step })}) calc(c * ${lightDarkAlteration(css, tokens, { light: -0.1, dark: -0.03, step })}) h)`;
}

export function darkenColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} calc(l * ${lightDarkAlteration(css, tokens, { light: -0.04, dark: 0.2, step })}) calc(c * ${lightDarkAlteration(css, tokens, { light: 0.01, dark: -0.09, step })}) h)`;
}

export function saturateColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(css, tokens, { light: 0.05, dark: 0.05, step })}) h)`;
}

export function desaturateColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(css, tokens, { light: -0.05, dark: -0.05, step })}) h)`;
}

export function fadeColorAlteration(
	css: Css,
	sourceColor: CalcInterpolation,
	opacity: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l c h / ${opacity})`;
}
