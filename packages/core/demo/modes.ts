import { arborModeSchema } from '../src/index.js';
import { primitives } from './primitives.js';

export const modeSchema = arborModeSchema.extend({
	density: 'other',
});

export const rootMode = modeSchema.createBase({
	mainColor: primitives.$tokens.colors.primary,
	neutralColor: primitives.$tokens.colors.primary.$neutral,
	surface: {
		primary: {
			bg: primitives.$tokens.colors.primary.wash.var,
			fg: primitives.$tokens.colors.primary.ink.var,
			border: primitives.$tokens.colors.primary.heavy.var,
		},
		secondary: {
			bg: primitives.$tokens.colors.primary.paper.var,
			fg: primitives.$tokens.colors.primary.$neutral.ink.var,
			border: primitives.$tokens.colors.primary.ink.var,
		},
		ambient: {
			bg: primitives.$tokens.colors.primary.$neutral.wash.var,
			fg: primitives.$tokens.colors.primary.$neutral.ink.var,
			border: primitives.$tokens.colors.primary.$neutral.heavy.var,
		},
	},
	control: {
		bg: primitives.$tokens.colors.primary.$neutral.paper.var,
		fg: primitives.$tokens.colors.primary.$neutral.ink.var,
		border: primitives.$tokens.colors.primary.$neutral.heavy.var,
	},
	action: {
		primary: {
			bg: primitives.$tokens.colors.primary.mid.var,
			fg: primitives.$tokens.colors.primary.ink.var,
			border: primitives.$tokens.colors.primary.heavy.var,
		},
		secondary: {
			bg: primitives.$tokens.colors.primary.$neutral.lighter.var,
			fg: primitives.$tokens.colors.primary.$neutral.heavier.var,
			border: primitives.$tokens.colors.primary.$neutral.heavy.var,
		},
		ambient: {
			bg: primitives.$tokens.colors.primary.$neutral.wash.var,
			fg: primitives.$tokens.colors.primary.$neutral.ink.var,
			border: primitives.$tokens.colors.primary.$neutral.heavy.var,
		},
	},
	text: {
		primary: {
			size: '5rem',
			weight: 'bold',
			lineHeight: '1.5',
			font: 'sans-serif',
		},
		secondary: {
			size: '1rem',
			weight: 'normal',
			lineHeight: '1.5',
			font: 'sans-serif',
		},
		ambient: {
			size: '0.875rem',
			weight: 'normal',
			lineHeight: '1.5',
			font: 'sans-serif',
		},
	},
	density: 1,
});

export const altMode = modeSchema.createPartial({
	mainColor: primitives.$tokens.colors.alt,
	neutralColor: primitives.$tokens.colors.alt.$neutral,
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

export const greenButtonsMode = modeSchema.createPartial({
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

export const denseMode = modeSchema.createPartial({
	density: 0.5,
});
