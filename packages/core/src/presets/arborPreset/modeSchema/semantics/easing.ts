import { createModeSchema } from '@arbor-css/modes';

export const easingSemantics = createModeSchema({
	$root: {
		purpose: 'easing-function',
		description: 'A convenient reference for the "medium" easing',
	},
	tight: {
		purpose: 'easing-function',
		description: 'A short, snappy easing, good for tight interactions',
	},
	medium: {
		purpose: 'easing-function',
		description: 'A medium easing, good for general use',
	},
	loose: {
		purpose: 'easing-function',
		description:
			'A long, relaxed easing, good for slow interactions and animations',
	},
});
