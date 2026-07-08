import { createModeSchema } from '@arbor-css/modes';

export const radiusSemantics = createModeSchema({
	$root: {
		purpose: 'border-radius',
		description: 'A convenient reference for the "md" border radius',
	},
	xs: 'border-radius',
	sm: 'border-radius',
	md: 'border-radius',
	lg: 'border-radius',
	full: 'border-radius',
});
