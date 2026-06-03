import { SimpleTokenSchema } from '@arbor-css/tokens';

export const spacingSemantics = {
	$root: {
		purpose: 'spacing',
		description: 'A convenient reference for the "md" spacing size',
	},
	xs: 'spacing',
	sm: 'spacing',
	md: 'spacing',
	lg: 'spacing',
	xl: 'spacing',
} satisfies SimpleTokenSchema;
