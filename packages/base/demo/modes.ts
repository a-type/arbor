import { createModeSchema } from '../src/index.js';
import { primitives } from './primitives.js';

const PROPS = primitives.$props;
// @ts-expect-error
PROPS.colors.arbitrary;

export const modeSchema = createModeSchema({
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
			border: 'color',
		},
		secondary: {
			bg: 'color',
			fg: 'color',
			border: 'color',
		},
		auxiliary: {
			bg: 'color',
			fg: 'color',
			border: 'color',
		},
	},
	surface: {
		primary: {
			bg: 'color',
			fg: 'color',
			border: 'color',
		},
		secondary: {
			bg: 'color',
			fg: 'color',
			border: 'color',
		},
		auxiliary: {
			bg: 'color',
			fg: 'color',
			border: 'color',
		},
	},
	control: {
		bg: 'color',
		fg: 'color',
		border: 'color',
	},
	text: {
		primary: {
			size: 'length',
			weight: '*',
			lineHeight: '*',
		},
		secondary: {
			size: 'length',
			weight: '*',
			lineHeight: '*',
		},
		auxiliary: {
			size: 'length',
			weight: '*',
			lineHeight: '*',
		},
	},
	density: 'number',
});

export const rootMode = modeSchema.createBase({
	mainColor: {
		paper: PROPS.colors.primary.paper.var,
		wash: PROPS.colors.primary.wash.var,
		lighter: PROPS.colors.primary.lighter.var,
		light: PROPS.colors.primary.light.var,
		mid: PROPS.colors.primary.mid.var,
		heavy: PROPS.colors.primary.heavy.var,
		heavier: PROPS.colors.primary.heavier.var,
		ink: PROPS.colors.primary.ink.var,
	},
	neutralColor: {
		paper: PROPS.colors.primary.neutral.paper.var,
		wash: PROPS.colors.primary.neutral.wash.var,
		lighter: PROPS.colors.primary.neutral.lighter.var,
		light: PROPS.colors.primary.neutral.light.var,
		mid: PROPS.colors.primary.neutral.mid.var,
		heavy: PROPS.colors.primary.neutral.heavy.var,
		heavier: PROPS.colors.primary.neutral.heavier.var,
		ink: PROPS.colors.primary.neutral.ink.var,
	},
	surface: {
		primary: {
			bg: PROPS.colors.primary.wash.var,
			fg: PROPS.colors.primary.ink.var,
			border: PROPS.colors.primary.heavy.var,
		},
		secondary: {
			bg: PROPS.colors.primary.paper.var,
			fg: PROPS.colors.primary.neutral.ink.var,
			border: PROPS.colors.primary.ink.var,
		},
		auxiliary: {
			bg: PROPS.colors.primary.neutral.wash.var,
			fg: PROPS.colors.primary.neutral.ink.var,
			border: PROPS.colors.primary.neutral.heavy.var,
		},
	},
	control: {
		bg: PROPS.colors.primary.neutral.paper.var,
		fg: PROPS.colors.primary.neutral.ink.var,
		border: PROPS.colors.primary.neutral.heavy.var,
	},
	action: {
		primary: {
			bg: PROPS.colors.primary.mid.var,
			fg: PROPS.colors.primary.ink.var,
			border: PROPS.colors.primary.heavy.var,
		},
		secondary: {
			bg: PROPS.colors.primary.neutral.lighter.var,
			fg: PROPS.colors.primary.neutral.heavier.var,
			border: PROPS.colors.primary.neutral.heavy.var,
		},
		auxiliary: {
			bg: PROPS.colors.primary.neutral.wash.var,
			fg: PROPS.colors.primary.neutral.ink.var,
			border: PROPS.colors.primary.neutral.heavy.var,
		},
	},
	text: {
		primary: {
			size: '5rem',
			weight: 'bold',
			lineHeight: '1.5',
		},
		secondary: {
			size: '1rem',
			weight: 'normal',
			lineHeight: '1.5',
		},
		auxiliary: {
			size: '0.875rem',
			weight: 'normal',
			lineHeight: '1.5',
		},
	},
	density: 1,
});

export const altMode = modeSchema.createPartial({
	mainColor: {
		paper: PROPS.colors.alt.paper.var,
		wash: PROPS.colors.alt.wash.var,
		lighter: PROPS.colors.alt.lighter.var,
		light: PROPS.colors.alt.light.var,
		mid: PROPS.colors.alt.mid.var,
		heavy: PROPS.colors.alt.heavy.var,
		heavier: PROPS.colors.alt.heavier.var,
		ink: PROPS.colors.alt.ink.var,
	},
	neutralColor: {
		paper: PROPS.colors.alt.neutral.paper.var,
		wash: PROPS.colors.alt.neutral.wash.var,
		lighter: PROPS.colors.alt.neutral.lighter.var,
		light: PROPS.colors.alt.neutral.light.var,
		mid: PROPS.colors.alt.neutral.mid.var,
		heavy: PROPS.colors.alt.neutral.heavy.var,
		heavier: PROPS.colors.alt.neutral.heavier.var,
		ink: PROPS.colors.alt.neutral.ink.var,
	},
	action: {
		primary: {
			bg: PROPS.colors.alt.mid.var,
			fg: PROPS.colors.alt.ink.var,
			border: PROPS.colors.alt.heavy.var,
		},
		secondary: {
			bg: PROPS.colors.alt.lighter.var,
			fg: PROPS.colors.alt.heavier.var,
			border: PROPS.colors.alt.heavy.var,
		},
		auxiliary: {
			bg: PROPS.colors.alt.wash.var,
			fg: PROPS.colors.alt.ink.var,
			border: PROPS.colors.alt.heavy.var,
		},
	},
	surface: {
		primary: {
			bg: PROPS.colors.alt.wash.var,
			fg: PROPS.colors.alt.ink.var,
			border: PROPS.colors.alt.heavy.var,
		},
		secondary: {
			bg: PROPS.colors.alt.paper.var,
			fg: PROPS.colors.alt.neutral.ink.var,
			border: PROPS.colors.alt.ink.var,
		},
		auxiliary: {
			bg: PROPS.colors.alt.neutral.wash.var,
			fg: PROPS.colors.alt.neutral.ink.var,
			border: PROPS.colors.alt.neutral.heavy.var,
		},
	},
	control: {
		border: PROPS.colors.alt.heavy.var,
		bg: PROPS.colors.alt.wash.var,
	},
});

export const greenButtonsMode = modeSchema.createPartial({
	action: {
		primary: {
			bg: PROPS.colors.green.mid.var,
			fg: PROPS.colors.green.ink.var,
			border: PROPS.colors.green.heavy.var,
		},
		secondary: {
			bg: PROPS.colors.green.lighter.var,
			fg: PROPS.colors.green.heavier.var,
			border: PROPS.colors.green.heavy.var,
		},
	},
});

export const denseMode = modeSchema.createPartial({
	density: 0.5,
});
