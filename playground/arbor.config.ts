import { definePreset } from '@arbor-css/core';
import { compileSingleColor, presetArbor } from '@arbor-css/core/preset-arbor';
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
			globals: {
				baseFontSize: 'calc(12px + 0.5vw)',
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
		primitive: {
			color: {
				user: compileSingleColor(
					{
						hue: $.mode.user.hue,
						saturation: $.mode.user.saturation,
					},
					$.mode.global,
				),
			},
		},
	}),
	mixins: makeMixins,
});

preset.bundleMode('success', {
	color: {
		main: preset.$.mode.primitive.color.success,
	},
});

preset.bundleMode('neutral', {
	color: {
		main: preset.$.mode.color.neutral,
	},
});

preset.bundleMode('user', {
	user: {
		hue: 'var(--user-hue, 0)',
		saturation: 'var(--user-saturation, 0.5)',
	},
	color: {
		main: preset.$.mode.primitive.color.user,
	},
});

export default preset;
