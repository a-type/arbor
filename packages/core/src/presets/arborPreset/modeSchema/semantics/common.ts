import { createModeSchema } from '@arbor-css/modes';

export const shadowLevelSemantics = createModeSchema({
	x: {
		purpose: 'size',
		description: 'Horizontal offset of the shadow',
	},
	y: {
		purpose: 'size',
		description: 'Vertical offset of the shadow',
	},
	blur: {
		purpose: 'size',
		description: 'Blur radius of the shadow',
	},
	spread: {
		purpose: 'size',
		description: 'Spread radius of the shadow',
	},
	color: {
		purpose: 'color',
		description: 'Color of the shadow',
	},
	$root: {
		purpose: 'shadow',
		description: 'Full shadow value, can be passed to "box-shadow"',
	},
});
