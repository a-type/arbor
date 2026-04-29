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
				sourceHue: 200,
				saturation: 0.3,
			},
			spring: {
				sourceHue: 120,
			},
			summer: {
				sourceHue: 158,
				saturation: 1,
			},
			fall: {
				sourceHue: 40,
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
	mainColor: primitives.$props.colors.summer,
	neutralColor: primitives.$props.colors.summer.$neutral,
	action: {
		primary: {
			bg: primitives.$props.colors.spring.mid,
			fg: primitives.$props.colors.spring.ink,
		},
	},
	surface: {
		primary: {
			bg: primitives.$props.colors.summer.wash,
			fg: primitives.$props.colors.summer.ink,
		},
		ambient: {
			bg: primitives.$props.colors.summer.$neutral.paper,
			fg: primitives.$props.colors.summer.$neutral.ink,
		},
	},
	density: 1,
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	return modeSchema.createPartial({
		mainColor: primitives.$props.colors[season],
		neutralColor: primitives.$props.colors[season].$neutral,
		action: {
			primary: {
				bg: primitives.$props.colors[season].mid,
				fg: primitives.$props.colors[season].ink,
			},
		},
		surface: {
			primary: {
				bg: primitives.$props.colors[season].wash,
				fg: primitives.$props.colors[season].ink,
			},
			ambient: {
				bg: primitives.$props.colors[season].$neutral.paper,
				fg: primitives.$props.colors[season].$neutral.ink,
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
