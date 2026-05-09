import { createArborPreset } from '@arbor-css/core';
import { createTheme } from './theme/index.js';

export const testArbor = createArborPreset({
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
