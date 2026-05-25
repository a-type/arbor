import { CalcInterpolation, Css } from '@arbor-css/calc';
import { SystemTokens } from '@arbor-css/globals';

export function lightDarkAlteration(
	css: Css,
	systemProps: SystemTokens,
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
	return css`calc(1 + ${step} * (${[systemProps.meta.scheme.whenLight, 1]} * ${light}) + (${[systemProps.meta.scheme.whenDark, 1]} * ${dark}))`;
}

export function lightenColorAlteration(
	css: Css,
	systemProps: SystemTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} calc(l * ${lightDarkAlteration(css, systemProps, { light: 0.02, dark: -0.07, step })}) calc(c * ${lightDarkAlteration(css, systemProps, { light: -0.1, dark: -0.03, step })}) h)`;
}

export function darkenColorAlteration(
	css: Css,
	systemProps: SystemTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} calc(l * ${lightDarkAlteration(css, systemProps, { light: -0.02, dark: 0.12, step })}) calc(c * ${lightDarkAlteration(css, systemProps, { light: 0.01, dark: -0.09, step })}) h)`;
}

export function saturateColorAlteration(
	css: Css,
	systemProps: SystemTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(css, systemProps, { light: 0.05, dark: 0.05, step })}) h)`;
}

export function desaturateColorAlteration(
	css: Css,
	systemProps: SystemTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(css, systemProps, { light: -0.05, dark: -0.05, step })}) h)`;
}

export function fadeColorAlteration(
	css: Css,
	sourceColor: CalcInterpolation,
	opacity: CalcInterpolation,
) {
	return css`oklch(from ${sourceColor} l c h / ${opacity})`;
}
