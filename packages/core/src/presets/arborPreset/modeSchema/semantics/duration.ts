import { createModeSchema } from '@arbor-css/modes';

export const durationSemantics = createModeSchema({
	$root: {
		purpose: 'duration',
		description: 'A convenient reference for the "medium" duration',
	},
	short: {
		purpose: 'duration',
		description:
			'A short, snappy duration, good for fast interactions and large animations',
	},
	medium: {
		purpose: 'duration',
		description:
			'A medium duration, good for general use, fast enough for interactions',
	},
	long: {
		purpose: 'duration',
		description:
			'A long, relaxed duration, good for slow interactions and animations',
	},
});
