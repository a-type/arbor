import { createModeSchema } from '@arbor-css/modes';

export const typographyPrimitiveLevel = createModeSchema({
	size: {
		purpose: 'font-size',
		description: 'The size of the font used in this typography level',
	},
	weight: {
		purpose: 'font-weight',
		description: 'The weight of the font used in this typography level',
	},
	lineHeight: {
		purpose: 'line-height',
		description: 'The line height of the font used in this typography level',
	},
});

export const typographyPrimitives = createModeSchema({
	xs: typographyPrimitiveLevel,
	sm: typographyPrimitiveLevel,
	md: typographyPrimitiveLevel,
	lg: typographyPrimitiveLevel,
	xl: typographyPrimitiveLevel,
	'2xl': typographyPrimitiveLevel,
	'3xl': typographyPrimitiveLevel,
	'4xl': typographyPrimitiveLevel,
	'5xl': typographyPrimitiveLevel,
	'6xl': typographyPrimitiveLevel,
});
