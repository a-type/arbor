import { createModeSchema } from './createModeSchema.js';

const colorIntents = {
	fg: 'color',
	bg: 'color',
	border: 'color',
} as const;

const textIntents = {
	size: 'length',
	weight: 'number',
	lineHeight: 'number',
	font: '*',
} as const;

export const arborModeSchema = createModeSchema({
	// colors
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

	// intents
	action: {
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
	},
	control: colorIntents,
	surface: {
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
	},
	text: {
		primary: textIntents,
		secondary: textIntents,
		ambient: textIntents,
	},
});
