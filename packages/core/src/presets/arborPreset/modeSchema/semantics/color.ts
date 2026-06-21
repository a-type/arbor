import { createModeSchema } from '@arbor-css/modes';
import {
	colorRangeSchema,
	colorRangeSchemaWithoutNeutral,
} from '../primitives/color.js';

export const mainColorSemantics = <TColorName extends string>(
	colorNames: TColorName[],
) =>
	createModeSchema({
		main: colorRangeSchema,
		neutral: colorRangeSchemaWithoutNeutral,

		palette: createColorPalettes(colorNames),
	});

function createColorPalettes<TColorName extends string>(
	colorNames: TColorName[],
): Record<TColorName, typeof colorRangeSchema> {
	return colorNames.reduce(
		(acc, colorName) => {
			acc[colorName] = colorRangeSchema;
			return acc;
		},
		{} as Record<TColorName, typeof colorRangeSchema>,
	);
}
