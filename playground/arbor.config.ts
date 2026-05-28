import { presetArbor } from '@arbor-css/core/preset-arbor';

const preset = presetArbor({
	color: {
		ranges: {
			brand: {
				hue: 98,
			},
			success: {
				hue: 120,
			},
		},
		mainColor: 'brand',
	},
});

preset.bundleMode('success', {
	color: {
		main: preset.$.primitives.color.success,
	},
});

export default preset;
