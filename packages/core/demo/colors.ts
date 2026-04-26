import { compileColors } from '../src/index.js';
import { contrastScheme } from './schemes.js';

export const colors = compileColors({
	ranges: {
		primary: {
			sourceHue: 98,
		},
		alt: {
			sourceHue: 210,
		},
		green: {
			sourceHue: 150,
		},
	},
	schemes: {
		contrast: contrastScheme,
	},
	globals: {
		saturation: 0.5,
	},
});

colors.contrast.primary.heavier;
// @ts-expect-error
colors.contrast.primary.arbitrary;
