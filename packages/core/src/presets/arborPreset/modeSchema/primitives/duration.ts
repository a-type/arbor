import { createModeSchema } from '@arbor-css/modes';

export const durationPrimitives = createModeSchema({
	$root: {
		purpose: 'duration',
		description: 'A convenient reference for the "medium" duration',
	},
	short: 'duration',
	medium: 'duration',
	long: 'duration',
});
