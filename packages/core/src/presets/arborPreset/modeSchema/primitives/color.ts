import { createModeSchema } from '@arbor-css/modes';

export const colorRangeSchemaWithoutNeutral = createModeSchema({
	$root: {
		purpose: 'color',
		description: 'A convenient reference for the "mid" shade',
	},
	paper: {
		purpose: 'color',
		description: 'An extremely light shade, good for backgrounds and surfaces',
	},
	wash: {
		purpose: 'color',
		description:
			'A very faint but slightly vibrant shade, good for backgrounds and surfaces',
	},
	light: {
		purpose: 'color',
		description: 'A light shade, good for emphasized surfaces.',
	},
	mid: {
		purpose: 'color',
		description: 'The main shade, good for primary actions and decoration.',
	},
	heavy: {
		purpose: 'color',
		description: 'A heavy shade, good for text emphasis and accents.',
	},
	ink: {
		purpose: 'color',
		description:
			'A very dark but still slightly vibrant shade, good for text and high contrast elements.',
	},
});

export const colorRangeSchema = createModeSchema({
	...colorRangeSchemaWithoutNeutral,
	$neutral: colorRangeSchemaWithoutNeutral,
});

export type ModePrimitiveColorRangeSchema = typeof colorRangeSchema;

export function createColorPrimitives<TColorName extends string>(
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
