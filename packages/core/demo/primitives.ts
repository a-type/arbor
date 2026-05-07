import { compileSpacing } from '@arbor-css/spacing';
import {
	compileColors,
	compileShadows,
	compileTypography,
	createGlobals,
	createPrimitives,
} from '../src/index.js';
import { contrastScheme } from './schemes.js';

const globals = createGlobals({
	saturation: 0.5,
	baseFontSize: '16px',
	roundness: 0.5,
	baseSpacingSize: '8px',
});

const colors = compileColors({
	ranges: {
		primary: {
			hue: 98,
		},
		alt: {
			hue: 210,
		},
		green: {
			hue: 150,
		},
	},
	schemes: {
		contrast: contrastScheme,
	},
	globals,
});

const typography = compileTypography({
	globals,
});
const spacing = compileSpacing({
	globals,
});
const shadows = compileShadows({
	globals,
});

export const primitives = createPrimitives({
	colors,
	typography,
	spacing,
	shadows,
	globals: {
		saturation: 0.5,
	},
	defaultScheme: 'light',
	schemeTags: {
		contrast: contrastScheme.tag,
	},
});
