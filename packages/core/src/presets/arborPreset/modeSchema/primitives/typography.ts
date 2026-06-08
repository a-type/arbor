import { createModeSchema } from '@arbor-css/modes';

export const typographyPrimitiveLevel = createModeSchema({
	size: {
		purpose: 'font-size',
		description: 'The size of the font used in this typography level',
	},
	lineHeight: {
		purpose: 'line-height',
		description: 'The line height of the font used in this typography level',
	},
	letterSpacing: {
		purpose: 'letter-spacing',
		description: 'The letter spacing of the font used in this typography level',
	},
});

export const typographyPrimitives = createModeSchema({
	weight: {
		thin: 'font-weight',
		light: 'font-weight',
		normal: 'font-weight',
		semiBold: 'font-weight',
		bold: 'font-weight',
		black: 'font-weight',
	},
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
