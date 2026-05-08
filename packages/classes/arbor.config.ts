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

const globals = createGlobals({
	shadowBlur: 0,
	shadowSpread: 0,
});

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

const baseMode = modeSchema.createBase(
	createArborModeValues({
		primitives,
		mainColor: 'brand',
	}),
);

export default createConfig({
	primitives,
	modes: {
		base: baseMode,
	},
});
