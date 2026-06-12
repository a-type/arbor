import { createModeSchema } from '@arbor-css/modes';
import { boxIntents, visualIntents } from './common.js';

export const controlIntents = createModeSchema({
	padding: boxIntents,
	roundness: {
		purpose: 'scalar',
		description:
			'This token controls the overall roundness of controls and stacks with the root roundness token',
	},
	radius: {
		purpose: 'border-radius',
		description:
			'This token captures the border-radius of controls, taking into account the overall roundness',
	},
	...visualIntents,
});
