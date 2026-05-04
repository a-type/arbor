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
import { globSync } from 'node:fs';
import { defineConfig } from 'unocss';
import { presetArbor } from './src/index.js';

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

const baseMode = modeSchema.createBase(
	createArborModeValues({
		primitives,
		mainColor: 'brand',
	}),
);

const arbor = createConfig({
	primitives,
	modes: {
		base: baseMode,
	},
});

const deps = [
	...globSync('./src/**/*.{ts,tsx}'),
	...globSync('../core/src/**/*.{ts,tsx}'),
	...globSync('../modes/src/**/*.{ts,tsx}'),
];
export default defineConfig({
	presets: [presetArbor(arbor)],
	configDeps: [...deps],
});
