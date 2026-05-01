import { createConfig } from '../src/index.js';
import { altMode, denseMode, greenButtonsMode, rootMode } from './modes.js';
import { primitives } from './primitives.js';

export const arbor = createConfig({
	primitives,
	modes: {
		base: rootMode,
		alt: altMode,
		greenButtons: greenButtonsMode,
		dense: denseMode,
	},
});

export default arbor;
