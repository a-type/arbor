import {
	arborModeSchema,
	compileColors,
	compileShadows,
	compileSpacing,
	compileTypography,
	createArborModeValues,
	createConfig,
	createGlobals,
	createPrimitives,
} from '@arbor-css/core';
import { createTheme } from './theme/index.js';

const globals = createGlobals({});

const primitives = createPrimitives({
	colors: compileColors({
		ranges: {
			brand: {
				hue: 200,
			},
		},
		globals,
	}),
	shadows: compileShadows({ globals }),
	spacing: compileSpacing({ globals }),
	typography: compileTypography({ globals }),
	globals,
});

const modeSchema = arborModeSchema;

export const testBaseMode = modeSchema.createBase(
	createArborModeValues({
		primitives,
		mainColor: 'brand',
	}),
);

export const testArbor = createConfig({
	primitives,
	modes: {
		base: testBaseMode,
	},
});

export const testTheme = createTheme(testArbor);
