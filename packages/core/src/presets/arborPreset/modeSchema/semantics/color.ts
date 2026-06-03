import { createModeSchema } from '@arbor-css/modes';
import { colorRangeSchemaWithoutNeutral } from '../primitives/color.js';

export const mainColorSemantics = createModeSchema({
	main: colorRangeSchemaWithoutNeutral,
	neutral: colorRangeSchemaWithoutNeutral,
});
