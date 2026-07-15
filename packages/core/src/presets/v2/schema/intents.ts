import { createModeSchema } from '@arbor-css/modes';

export const visualIntents = createModeSchema({
	fg: {
		purpose: 'color',
		description: 'Foreground color',
	},
	bg: {
		purpose: 'background',
		description:
			'Background - can be a color or a more complex value like a gradient or image',
	},
	b: {
		$root: {
			purpose: 'border',
			description:
				'Compiles the border color, width, and style into a single token for direct assignment to border.',
		},
		color: 'color',
		width: 'border-width',
		style: 'border-style',
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
	letterSpacing: 'letter-spacing',
});
