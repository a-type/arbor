import { createModeSchema } from '@arbor-css/modes';
import {
	colorRangeSchema,
	colorRangeSchemaWithoutNeutral,
} from '../primitives/color.js';

export const mainColorSemantics = createModeSchema({
	main: colorRangeSchema,
	neutral: colorRangeSchemaWithoutNeutral,
});
