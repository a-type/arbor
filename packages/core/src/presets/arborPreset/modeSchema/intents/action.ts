import { createModeSchema } from '@arbor-css/modes';
import { boxIntents, textAndFontIntents, visualIntents } from './common.js';

export const actionIntents = createModeSchema({
	padding: boxIntents,
	roundness: {
		purpose: 'scalar',
		description:
			'This token controls the overall roundness of actions and stacks with the root roundness token',
	},
	radius: {
		purpose: 'border-radius',
		description:
			'This token captures the border-radius of actions, taking into account the overall roundness',
	},
	text: textAndFontIntents,
	primary: visualIntents,
	secondary: visualIntents,
	ambient: visualIntents,
});
