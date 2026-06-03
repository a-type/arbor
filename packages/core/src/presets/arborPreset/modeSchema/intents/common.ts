import { createModeSchema } from '@arbor-css/modes';

export const colorIntents = createModeSchema({
	fg: {
		purpose: 'color',
		description: 'Intended for use as the foreground color',
	},
	bg: {
		purpose: 'color',
		description: 'Intended for use as the background color',
	},
	border: {
		purpose: 'color',
		description: 'Intended for use as the border color, if desired',
	},
});

export const boxIntents = createModeSchema({
	$root: {
		purpose: 'other',
		description:
			'Combines inline and block padding, can be passed directly to "padding"',
	},
	inline: {
		purpose: 'spacing',
		description: 'Inline (horizontal, usually) padding',
	},
	block: {
		purpose: 'spacing',
		description: 'Block (vertical, usually) padding',
	},
});

export const textAndFontIntents = createModeSchema({
	size: 'font-size',
	weight: 'font-weight',
	lineHeight: 'line-height',
	font: 'font-family',
});
