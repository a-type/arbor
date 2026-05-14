import { createArborPreset } from '@arbor-css/preset';

const preset = createArborPreset({
	globals: {
		shadowBlur: 0,
		shadowSpread: 0,
	},
	colors: {
		mainColor: 'brand',
		ranges: {
			brand: {
				hue: 95,
			},
		},
	},
});

export default preset;
