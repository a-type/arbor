import { css, CssInterpolation } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';

export type RequiredTokens = {
	whenLight: Token;
	whenDark: Token;
};

// Tune this to adjust the magnitude of all color alterations
const ALTERATION_MAGNITUDE = 0.5;

export function lightDarkAlteration(
	tokens: RequiredTokens,
	{
		light,
		dark,
		step,
	}: {
		light: number;
		dark: number;
		step: CssInterpolation;
	},
) {
	return css`calc(1 + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * ${light}) + (${[tokens.whenDark, 1]} * ${dark}))`;
}

// Perceptual adjustment curves for more uniform steps across lightness range.
// Using power 0.5 instead of 2 distributes changes more evenly and prevents
// undershooting at extremes while maintaining stronger adjustment near black/white.
// TODO: re-enable the power curve when Firefox passes the WPT color spec test:
// https://wpt.live/css/css-color/parsing/color-computed-relative-color.html#:~:text=Property%20color%20value%20%27oklch%28from%20green%20pow%28l%2C%201%29%20c%20h%29%27
// const distanceFromWhite = css`calc(pow(1 - l, 0.5))`;
// const distanceFromBlack = css`calc(pow(l, 0.5))`;
const distanceFromWhite = css`calc(1 - l)`;
const distanceFromBlack = css`calc(l)`;
const compensateForDarkModeBlack = 0.3; // pulling this out as a named var so I remember how to tune this later.

export function lightenColorAlteration(
	tokens: RequiredTokens,
	sourceColor: CssInterpolation,
	step: CssInterpolation,
) {
	// In light mode: lighten by moving away from black (closer to white)
	// In dark mode: lighten by moving toward page neutral (darker, so reduce l)
	const l = css`calc(l + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * ${distanceFromWhite} * ${compensateForDarkModeBlack} + ${[tokens.whenDark, 1]} * -0.08))`;
	return css`oklch(from ${sourceColor} ${l} calc(c * ${lightDarkAlteration(tokens, { light: -0.08, dark: -0.02, step })}) h)`;
}

export function darkenColorAlteration(
	tokens: RequiredTokens,
	sourceColor: CssInterpolation,
	step: CssInterpolation,
) {
	// In light mode: darken by moving toward black (reducing l)
	// In dark mode: darken by moving away from page neutral (lighter, so increase l)
	const l = css`calc(l + ${step} * ${ALTERATION_MAGNITUDE} * (${[tokens.whenLight, 1]} * -1 * ${distanceFromBlack} * 0.08 + ${[tokens.whenDark, 1]} * ${distanceFromWhite} * ${compensateForDarkModeBlack}))`;
	return css`oklch(from ${sourceColor} ${l} calc(c * ${lightDarkAlteration(tokens, { light: 0.01, dark: -0.07, step })}) h)`;
}

export function saturateColorAlteration(
	tokens: RequiredTokens,
	sourceColor: CssInterpolation,
	step: CssInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(tokens, { light: 0.5, dark: 0.5, step })}) h)`;
}

export function desaturateColorAlteration(
	tokens: RequiredTokens,
	sourceColor: CssInterpolation,
	step: CssInterpolation,
) {
	return css`oklch(from ${sourceColor} l calc(c * ${lightDarkAlteration(tokens, { light: -0.5, dark: -0.5, step })}) h)`;
}

export function fadeColorAlteration(
	sourceColor: CssInterpolation,
	opacity: CssInterpolation,
) {
	return css`oklch(from ${sourceColor} l c h / ${opacity})`;
}
