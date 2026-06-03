import { createModeSchema } from '@arbor-css/modes';
import { shadowLevelSemantics } from './common.js';

export const shadowSemantics = createModeSchema({
	$root: {
		purpose: 'shadow',
		description: 'A convenient reference for the "md" shadow level',
	},
	color: {
		purpose: 'color',
		description:
			'If specified, this token overrides shadow colors from primitives',
	},
	sm: shadowLevelSemantics,
	md: shadowLevelSemantics,
	lg: shadowLevelSemantics,
	xl: shadowLevelSemantics,
});
