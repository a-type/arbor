import {
	arborModeSchema,
	compileColors,
	compileShadows,
	compileSpacing,
	compileTypography,
	createArborMode,
	createConfig,
	createGlobals,
	createPrimitives,
} from '@arbor-css/core';

const globals = createGlobals({
	saturation: 0.5,
});

const primitives = createPrimitives({
	colors: compileColors({
		ranges: {
			winter: {
				hue: 200,
				saturation: 0.3,
			},
			spring: {
				hue: 120,
			},
			summer: {
				hue: 158,
				saturation: 1,
			},
			fall: {
				hue: 40,
				saturation: 0.4,
			},
		},
		globals,
	}),
	typography: compileTypography({
		globals,
	}),
	spacing: compileSpacing({
		globals,
	}),
	shadows: compileShadows({
		globals,
	}),
});

const modeSchema = arborModeSchema;

const rootMode = createArborMode({
	mainColor: 'summer',
	primitives,
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	return modeSchema.createPartial(season, {
		mainColor: primitives.$tokens.colors[season],
		neutralColor: primitives.$tokens.colors[season].$neutral,
		action: {
			primary: {
				bg: primitives.$tokens.colors[season].mid,
				fg: primitives.$tokens.colors[season].ink,
			},
		},
		surface: {
			primary: {
				bg: primitives.$tokens.colors[season].wash,
				fg: primitives.$tokens.colors[season].ink,
			},
			ambient: {
				bg: primitives.$tokens.colors[season].$neutral.paper,
				fg: primitives.$tokens.colors[season].$neutral.ink,
			},
		},
	});
}

const winterMode = makeSeasonMode('winter');
const springMode = makeSeasonMode('spring');
const summerMode = makeSeasonMode('summer');
const fallMode = makeSeasonMode('fall');

export const arbor = createConfig({
	primitives,
	modes: {
		base: rootMode,
		winter: winterMode,
		spring: springMode,
		summer: summerMode,
		fall: fallMode,
	},
});
