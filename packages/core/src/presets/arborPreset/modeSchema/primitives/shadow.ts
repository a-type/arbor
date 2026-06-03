import { createModeSchema } from '@arbor-css/modes';

export const shadowPrimitiveLevel = createModeSchema({
	$root: {
		purpose: 'shadow',
		description: 'Full shadow value, can be passed to "box-shadow"',
	},
	x: {
		purpose: 'shadow-x',
		description: 'Horizontal offset of the shadow',
	},
	y: {
		purpose: 'shadow-y',
		description: 'Vertical offset of the shadow',
	},
	blur: {
		purpose: 'shadow-blur',
		description: 'Blur radius of the shadow',
	},
	spread: {
		purpose: 'shadow-spread',
		description: 'Spread radius of the shadow',
	},
	color: {
		purpose: 'shadow-color',
		description: 'Color of the shadow',
	},
});

export const shadowPrimitives = createModeSchema({
	xs: shadowPrimitiveLevel,
	sm: shadowPrimitiveLevel,
	md: shadowPrimitiveLevel,
	lg: shadowPrimitiveLevel,
	xl: shadowPrimitiveLevel,
});
