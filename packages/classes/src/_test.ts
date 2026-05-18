import { createArbor } from '@arbor-css/core';
import { createTheme } from './theme/index.js';

export const testArbor = createArbor().preset({
	colors: {
		mainColor: 'brand',
		ranges: {
			brand: {
				hue: 200,
			},
		},
	},
});

export const testBaseMode = testArbor.modes.base;

export const testTheme = createTheme(testArbor);
