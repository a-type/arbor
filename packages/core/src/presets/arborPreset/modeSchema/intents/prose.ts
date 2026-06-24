import { createModeSchema } from '@arbor-css/modes';
import { textAndFontIntents } from './common.js';

export const proseIntents = createModeSchema({
	primary: textAndFontIntents,
	secondary: textAndFontIntents,
	ambient: textAndFontIntents,
});
