import { createArbor } from '@arbor-css/core';

const preset = createArbor()
	.preset({
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
		global: {},
	})
	.withMode('success', (base) => ({
		color: {
			main: base.$.primitives.color.success,
		},
	}));

export default preset;
