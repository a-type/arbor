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
			user: {
				hue: 'var(--user-hue, 200)',
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

preset.bundleMode('user', {
	color: {
		main: preset.$.primitives.color.user,
	},
});

export default preset;
