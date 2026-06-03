import { createModeSchema } from '@arbor-css/modes';
import { boxIntents, colorIntents } from './common.js';

export const surfaceIntents = createModeSchema({
	padding: boxIntents,
	roundness: {
		purpose: 'scalar',
		description:
			'This token controls the overall roundness of surfaces and stacks with the root roundness token',
	},
	radius: {
		purpose: 'border-radius',
		description:
			'This token captures the border-radius of surfaces, taking into account the overall roundness',
	},
	primary: colorIntents,
	secondary: colorIntents,
	ambient: colorIntents,
});
