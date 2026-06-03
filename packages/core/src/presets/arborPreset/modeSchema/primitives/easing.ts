import { createModeSchema } from '@arbor-css/modes';

export const easingPrimitives = createModeSchema({
	$root: {
		purpose: 'easing-function',
		description: 'A convenient reference for the "medium" easing',
	},
	tight: 'easing-function',
	medium: 'easing-function',
	loose: 'easing-function',
});
