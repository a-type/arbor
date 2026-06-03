import { createModeSchema } from '@arbor-css/modes';

export const lineWidthSemantics = createModeSchema({
	$root: {
		purpose: 'border-width',
		description: 'A convenient reference for the "md" border width',
	},
	sm: {
		purpose: 'border-width',
		description:
			'A hairline border width. Always >= 1px. If the global border width is small, this may be the same as "md"',
	},
	md: {
		purpose: 'border-width',
		description: 'A general-purpose border width',
	},
	lg: {
		purpose: 'border-width',
		description: 'A thicker border, good for emphasis',
	},
});
