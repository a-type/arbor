import { arborModeSchema, createArborModeValues } from '../src/index.js';
import { primitives } from './primitives.js';

export const modeSchema = arborModeSchema;

export const rootMode = modeSchema.createBase({
	...createArborModeValues({
		primitives,
		mainColor: 'primary',
	}),
});

export const altMode = modeSchema.createPartial('alt', {
	colors: {
		main: primitives.$tokens.colors.alt,
		neutral: primitives.$tokens.colors.alt.$neutral,
	},
	action: {
		primary: {
			bg: primitives.$tokens.colors.alt.mid.var,
			fg: primitives.$tokens.colors.alt.ink.var,
			border: primitives.$tokens.colors.alt.heavy.var,
		},
		secondary: {
			bg: primitives.$tokens.colors.alt.lighter.var,
			fg: primitives.$tokens.colors.alt.heavier.var,
			border: primitives.$tokens.colors.alt.heavy.var,
		},
		ambient: {
			bg: primitives.$tokens.colors.alt.wash.var,
			fg: primitives.$tokens.colors.alt.ink.var,
			border: primitives.$tokens.colors.alt.heavy.var,
		},
	},
	surface: {
		primary: {
			bg: primitives.$tokens.colors.alt.wash.var,
			fg: primitives.$tokens.colors.alt.ink.var,
			border: primitives.$tokens.colors.alt.heavy.var,
		},
		secondary: {
			bg: primitives.$tokens.colors.alt.paper.var,
			fg: primitives.$tokens.colors.alt.$neutral.ink.var,
			border: primitives.$tokens.colors.alt.ink.var,
		},
		ambient: {
			bg: primitives.$tokens.colors.alt.$neutral.wash.var,
			fg: primitives.$tokens.colors.alt.$neutral.ink.var,
			border: primitives.$tokens.colors.alt.$neutral.heavy.var,
		},
	},
	control: {
		border: primitives.$tokens.colors.alt.heavy.var,
		bg: primitives.$tokens.colors.alt.wash.var,
	},
});

export const greenButtonsMode = modeSchema.createPartial('greenButtons', {
	action: {
		primary: {
			bg: primitives.$tokens.colors.green.mid.var,
			fg: primitives.$tokens.colors.green.ink.var,
			border: primitives.$tokens.colors.green.heavy.var,
		},
		secondary: {
			bg: primitives.$tokens.colors.green.lighter.var,
			fg: primitives.$tokens.colors.green.heavier.var,
			border: primitives.$tokens.colors.green.heavy.var,
		},
	},
});

export const denseMode = modeSchema.createPartial('dense', {
	density: 2,
});
