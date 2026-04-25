import { createConfig } from '../src/index.js';
import { altMode, denseMode, greenButtonsMode, rootMode } from './modes.js';
import { contrastScheme } from './schemes.js';

export const arbor = createConfig({
	namedHues: { primary: 90, alt: 210, green: 150 },
	saturation: 0.5,
	modes: {
		base: rootMode,
		alt: altMode,
		greenButtons: greenButtonsMode,
		dense: denseMode,
	},
	customSchemes: {
		contrast: contrastScheme,
	},
});
