import { createModeSchema } from '@arbor-css/modes';

export const shadowSemantic = createModeSchema({
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

export const colorRangeSemantic = createModeSchema({
	$root: {
		purpose: 'color',
		description: 'The base color of the range',
	},
	paper: {
		purpose: 'color',
		description: 'The lightest color in the range',
	},
	wash: {
		purpose: 'color',
		description: 'A light color in the range, lighter than the base color',
	},
	light: {
		purpose: 'color',
		description: 'A light color in the range, lighter than the base color',
	},
	mid: {
		purpose: 'color',
		description: 'A mid-tone color in the range, similar to the base color',
	},
	heavy: {
		purpose: 'color',
		description: 'A dark color in the range, darker than the base color',
	},
	ink: {
		purpose: 'color',
		description:
			'The darkest color in the range, usually used for text and other high-contrast elements',
	},
});

export const colorRangeWithGraySemantic = {
	...colorRangeSemantic,
	gray: colorRangeSemantic,
};

export const colorsSemantics = <TColorName extends string>(
	colorNames: TColorName[],
) => {
	return createModeSchema({
		palette: createColorPaletteSemantics(colorNames),
	}).palette;
};

function createColorPaletteSemantics<TColorName extends string>(
	colorNames: TColorName[],
): Record<TColorName, typeof colorRangeWithGraySemantic> {
	return colorNames.reduce(
		(acc, colorName) => {
			acc[colorName] = colorRangeWithGraySemantic;
			return acc;
		},
		{} as Record<TColorName, typeof colorRangeWithGraySemantic>,
	);
}

export interface ModeColorRangeSchema {
	$root: 'color';
	paper: 'color';
	wash: 'color';
	light: 'color';
	mid: 'color';
	heavy: 'color';
	ink: 'color';

	gray: {
		$root: 'color';
		paper: 'color';
		wash: 'color';
		light: 'color';
		mid: 'color';
		heavy: 'color';
		ink: 'color';
	};
}
