import { definePreset } from '@arbor-css/core';
import { compileSingleColor, presetArbor } from '@arbor-css/core/preset-arbor';

const preset = definePreset({
	name: 'test',
	extends: [
		presetArbor({
			color: {
				ranges: {
					brand: {
						hue: 98,
					},
					success: {
						hue: 165.88,
					},
					user: {
						hue: 0,
					},
				},
				mainColor: 'brand',
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
});

preset.bundleMode('success', {
	color: {
		main: preset.$.mode.primitive.color.success,
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
