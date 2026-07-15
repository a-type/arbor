import { definePreset } from '@arbor-css/core';
import { compileSingleColor, presetArbor } from '@arbor-css/core/preset-v2';
import { makeMixins } from './mixins';

const preset = definePreset({
	name: 'test',
	extends: [
		presetArbor({
			color: {
				ranges: {
					brand: {
						hue: 98,
						neutralSaturation: 0.5,
					},
					success: {
						hue: 165.88,
						neutralSaturation: 0.5,
					},
					user: {
						hue: 0,
						neutralSaturation: 0.5,
					},
				},
				mainColor: 'brand',
			},
			keyframes: {
				fadeIn: (css) => css`
					0% {
						opacity: 0;
					}
					100% {
						opacity: 1;
					}
				`,
				fadeOut: (css) => css`
					0% {
						opacity: 1;
					}
					100% {
						opacity: 0;
					}
				`,
			},
		}),
	],

	modeSchema: {
		user: {
			hue: 'other',
			saturation: 'scalar',
		},
	},
	baseMode: ($) => ({
		user: {
			hue: 0,
			saturation: 0.5,
		},
		color: {
			user: compileSingleColor(
				{
					hue: $.mode.user.hue,
					saturation: $.mode.user.saturation,
				},
				$.mode.global,
			),
		},
	}),
	mixins: makeMixins,

	config: {
		modeTokenPrefix: '--',
	},
});

preset.bundleMode('success', {
	tint: preset.$.mode.color.success,
});

preset.bundleMode('neutral', {
	tint: preset.$.mode.gray,
});

preset.bundleMode('user', {
	user: {
		hue: 'var(--user-hue, 0)',
		saturation: 'var(--user-saturation, 0.5)',
	},
	tint: preset.$.mode.color.user,
});

export default preset;
