import { CalcInterpolation, css, Css } from '@arbor-css/calc';
import { Token } from '@arbor-css/tokens';

export type RequiredTokens = {
	whenLight: Token;
	whenDark: Token;
};

// Tune this to adjust the magnitude of all color alterations
const ALTERATION_MAGNITUDE = 0.5;

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
	return css`calc(1 + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * ${light}) + (${[tokens.whenDark, 1]} * ${dark}))`;
}

// Perceptual adjustment curves for more uniform steps across lightness range.
// Using power 0.5 instead of 2 distributes changes more evenly and prevents
// undershooting at extremes while maintaining stronger adjustment near black/white.
const distanceFromWhite = css`pow(1 - l, 0.5)`;
const distanceFromBlack = css`pow(l, 0.5)`;

export function lightenColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	// In light mode: lighten by moving away from black (closer to white)
	// In dark mode: lighten by moving toward page neutral (darker, so reduce l)
	const l = css`calc(l + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * ${distanceFromWhite} * 2 + ${[tokens.whenDark, 1]} * -0.08))`;
	return css`oklch(from ${sourceColor} ${l} calc(c * ${lightDarkAlteration(css, tokens, { light: -0.08, dark: -0.02, step })}) h)`;
}

export function darkenColorAlteration(
	css: Css,
	tokens: RequiredTokens,
	sourceColor: CalcInterpolation,
	step: CalcInterpolation,
) {
	// In light mode: darken by moving toward black (reducing l)
	// In dark mode: darken by moving away from page neutral (lighter, so increase l)
	const compensateForDarkModeBlack = 0.3; // pulling this out as a named var so I remember how to tune this later.
	const l = css`calc(l + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * -${distanceFromBlack} * 0.08 + ${[tokens.whenDark, 1]} * ${distanceFromWhite} * ${compensateForDarkModeBlack}))`;
	return css`oklch(from ${sourceColor} ${l} calc(c * ${lightDarkAlteration(css, tokens, { light: 0.01, dark: -0.07, step })}) h)`;
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
