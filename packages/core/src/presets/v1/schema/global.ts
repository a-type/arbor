import { createModeSchema } from '@arbor-css/modes';
import { SimpleTokensAsTokenDefinitions } from '@arbor-css/tokens';

export const global = createModeSchema({
	color: {
		saturation: {
			purpose: 'scalar',
			description: 'Applies global saturation adjustments to all colors',
		},
	},
	space: {
		density: {
			purpose: 'scalar',
			description:
				'A scaling factor for density. Higher density means smaller, tighter spacing and size',
		},
		baseSize: {
			purpose: 'spacing',
			description:
				'Defines the base spacing unit used to derive spacing and layout tokens.',
		},
		scaleBase: {
			purpose: 'scalar',
			description:
				'The "base" number of the scale equation - a linear scalar multiplier. Set this to scale by some linear factor if scaleExponent is "1"',
		},
		scaleExponentStep: {
			purpose: 'scalar',
			description:
				'The exponent of the scale equation - the rate of exponential growth. `scaleBase` is raised to this exponent before being multiplied by the base spacing size. Set this to "1" to scale linearly by the `scaleBase` factor, or set it to a value greater than "1" to have exponential growth.',
		},
	},
	shape: {
		roundness: {
			purpose: 'scalar',
			description:
				'Controls the roundness of corners. Larger roundness values also may affect padding.',
		},
		lineWidth: {
			purpose: 'scalar',
			description: 'Controls the width of lines used for borders, etc.',
		},
	},
	shadow: {
		spread: {
			purpose: 'scalar',
			description: 'Controls the spread size of all shadows.',
		},
		blur: {
			purpose: 'scalar',
			description: 'Controls the blur scaling of all shadows.',
		},
		color: {
			purpose: 'color',
			description:
				'Provides the default shadow color used when a shadow token does not supply its own color.',
		},
	},
	typography: {
		baseFontSize: {
			purpose: 'font-size',
			description:
				'Defines the root font size used to derive typography tokens.',
		},
		size: {
			purpose: 'scalar',
			description:
				'A global parameter to influence the overall font size of all typography tokens.',
		},
		weightStep: {
			purpose: 'scalar',
			description:
				'The amount of font weight change between each typography level. This is multiplied by the level index to determine how much to adjust font weight at each level.',
		},
		minWeight: {
			purpose: 'scalar',
			description: 'The minimum font weight to use in the typography scale.',
		},
		maxWeight: {
			purpose: 'scalar',
			description: 'The maximum font weight to use in the typography scale.',
		},
		baseWeight: {
			purpose: 'scalar',
			description:
				'The base font weight from which to calculate typography levels. This is typically the "normal" font weight (e.g. 400), and level adjustments are applied as positive or negative offsets from this base.',
		},
		lineHeightStep: {
			purpose: 'scalar',
			description:
				'The amount of line height change between each typography level. This is multiplied by the level index to determine how much to adjust line height at each level.',
		},
		minLineHeight: {
			purpose: 'scalar',
			description: 'The minimum line height to use in the typography scale.',
		},
		maxLineHeight: {
			purpose: 'scalar',
			description: 'The maximum line height to use in the typography scale.',
		},
		baseLineHeight: {
			purpose: 'scalar',
			description:
				'The base line height from which to calculate typography levels. This is typically the line height used at the default typography level, and level adjustments are applied as positive or negative offsets from this base.',
		},
		minFontSize: {
			purpose: 'font-size',
			description: 'The minimum font size to use in the typography scale.',
		},
		maxFontSize: {
			purpose: 'font-size',
			description: 'The maximum font size to use in the typography scale.',
		},
		fontSizeScaleBase: {
			purpose: 'scalar',
			description:
				'The "base" number of the font size scale equation - a linear scalar multiplier. Set this to scale by some linear factor if sizeExponent is "1"',
		},
		fontSizeScaleExponentStep: {
			purpose: 'scalar',
			description:
				'The exponent of the font size scale equation - the rate of exponential growth. `fontSizeScaleBase` is raised to this exponent before being multiplied by the base font size. Set this to "1" to scale linearly by the `fontSizeScaleBase` factor, or set it to a value greater than "1" to have exponential growth.',
		},
		letterSpacingStep: {
			purpose: 'scalar',
			description:
				'The amount of letter spacing change between each typography level. This is multiplied by the level index to determine how much to adjust letter spacing at each level.',
		},
		minLetterSpacing: {
			purpose: 'spacing',
			description: 'The minimum letter spacing to use in the typography scale.',
		},
		maxLetterSpacing: {
			purpose: 'spacing',
			description: 'The maximum letter spacing to use in the typography scale.',
		},
		baseLetterSpacing: {
			purpose: 'spacing',
			description:
				'The base letter spacing from which to calculate typography levels. This is typically the letter spacing used at the default typography level, and level adjustments are applied as positive or negative offsets from this base.',
		},
		darkModeWeightAdjustment: {
			purpose: 'scalar',
			description:
				'An adjustment applied to font weight when in dark mode to compensate for the irradiation illusion. This is typically a negative value to reduce font weight in dark mode, but it can be positive if your theme has very light text and you want to increase weight in dark mode.',
		},
		boldness: {
			purpose: 'scalar',
			description:
				'An overall scaling factor for how heavy font weight tokens are.',
		},
	},
	ease: {
		bounciness: {
			purpose: 'scalar',
			description:
				'Controls the bounciness of easing functions. Higher values result in more overshoot and bounce.',
		},
	},
	duration: {
		slowness: {
			purpose: 'scalar',
			description:
				'Controls the overall slowness of durations. Higher values result in longer durations.',
		},
		base: {
			purpose: 'duration',
			description:
				'The base duration used to derive all other durations. This can be thought of as the "medium" duration, and other durations are calculated as multiples or fractions of this base.',
		},
		min: {
			purpose: 'duration',
			description: 'The minimum duration to use in the duration scale.',
		},
		max: {
			purpose: 'duration',
			description: 'The maximum duration to use in the duration scale.',
		},
	},
});

export type GlobalTokens = SimpleTokensAsTokenDefinitions<typeof global>;
