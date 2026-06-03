import { createModeSchema } from '@arbor-css/modes';

export const global = createModeSchema({
	density: {
		purpose: 'scalar',
		description:
			'A scaling factor for density. Higher density means smaller, tighter spacing and size',
	},
	saturation: {
		purpose: 'scalar',
		description: 'Applies global saturation adjustments to all colors',
	},
	roundness: {
		purpose: 'scalar',
		description:
			'Controls the roundness of corners. Larger roundness values also may affect padding.',
	},
	shadowSpread: {
		purpose: 'scalar',
		description: 'Controls the spread size of all shadows.',
	},
	shadowBlur: {
		purpose: 'scalar',
		description: 'Controls the blur scaling of all shadows.',
	},
	lineWidth: {
		purpose: 'scalar',
		description: 'Controls the width of lines used for borders, etc.',
	},
	baseFontSize: {
		purpose: 'font-size',
		description: 'Defines the root font size used to derive typography tokens.',
	},
	baseSpacingSize: {
		purpose: 'spacing',
		description:
			'Defines the base spacing unit used to derive spacing and layout tokens.',
	},
	defaultShadowColor: {
		purpose: 'color',
		description:
			'Provides the default shadow color used when a shadow token does not supply its own color.',
	},
});
