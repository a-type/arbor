import { presetArbor } from '@arbor-css/core/preset-arbor';

const preset = presetArbor({
	color: {
		ranges: {
			brand: {
				hue: 98,
			},
			success: {
				hue: 165.88,
			},
			user: {
				hue: 'var(--user-hue, 200)',
			},
		},
		mainColor: 'brand',
	},
});

preset.bundleMode('success', {
	color: {
		main: preset.$.mode.primitive.color.success,
	},
});

preset.bundleMode('user', {
	color: {
		main: preset.$.mode.primitive.color.user,
	},
});

export default preset;
