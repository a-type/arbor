import { createModeSchema } from '@arbor-css/modes';
import { textAndFontIntents } from './common.js';

export const textIntents = createModeSchema({
	primary: textAndFontIntents,
	secondary: textAndFontIntents,
	ambient: textAndFontIntents,
});
