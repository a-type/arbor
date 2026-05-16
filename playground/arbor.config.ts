import { createArborPreset } from '@arbor-css/core';

const preset = createArborPreset({
	colors: {
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
	globals: {},
}).withMode('success', (base) => ({
	color: {
		main: base.primitives.$tokens.colors.success,
	},
}));

export default preset;
