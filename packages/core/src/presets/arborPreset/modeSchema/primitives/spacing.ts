import { createModeSchema } from '@arbor-css/modes';

export const spacingPrimitives = createModeSchema({
	$root: {
		purpose: 'spacing',
		description: 'A convenient reference for the "md" spacing size',
	},
	'2xs': 'spacing',
	xs: 'spacing',
	sm: 'spacing',
	md: 'spacing',
	lg: 'spacing',
	xl: 'spacing',
	'2xl': 'spacing',
});
