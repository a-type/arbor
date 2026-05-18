import { createArbor } from '@arbor-css/preset';

const preset = createArbor().preset({
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
