import {
	compileColors,
	createConfig,
	createModeSchema,
	createPrimitives,
} from '@arbor-css/core';

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
		globals: {
			saturation: 0.5,
		},
	}),
});

const modeSchema = createModeSchema({
	mainColor: {
		paper: 'color',
		wash: 'color',
		lighter: 'color',
		light: 'color',
		mid: 'color',
		heavy: 'color',
		heavier: 'color',
		ink: 'color',
	},
	neutralColor: {
		paper: 'color',
		wash: 'color',
		lighter: 'color',
		light: 'color',
		mid: 'color',
		heavy: 'color',
		heavier: 'color',
		ink: 'color',
	},
	action: {
		primary: {
			bg: 'color',
			fg: 'color',
		},
	},
	surface: {
		primary: {
			bg: 'color',
			fg: 'color',
		},
		ambient: {
			bg: 'color',
			fg: 'color',
		},
	},
	density: 'number',
});

const rootMode = modeSchema.createBase({
	mainColor: primitives.$tokens.colors.summer,
	neutralColor: primitives.$tokens.colors.summer.$neutral,
	action: {
		primary: {
			bg: primitives.$tokens.colors.spring.mid,
			fg: primitives.$tokens.colors.spring.ink,
		},
	},
	surface: {
		primary: {
			bg: primitives.$tokens.colors.summer.wash,
			fg: primitives.$tokens.colors.summer.ink,
		},
		ambient: {
			bg: primitives.$tokens.colors.summer.$neutral.paper,
			fg: primitives.$tokens.colors.summer.$neutral.ink,
		},
	},
	density: 1,
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	return modeSchema.createPartial({
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
