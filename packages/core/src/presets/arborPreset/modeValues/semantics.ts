import { css } from '@arbor-css/css-eval';
import { ModeValues } from '@arbor-css/modes';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';
import { compileColors, CompileColorsOptions } from './color/compile.js';
import { Tokens } from './types.js';

export function createShadowLevelSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	level: number,
) {
	const x = css`0px`;
	const y = css`calc(1px * pow(2, ${level} - 1))`;
	const blur = css`calc(${$.mode.global.shadow.blur} * ${$.mode.global.spacing.baseSize} * 0.25 * pow(2, ${level} - 1))`;
	const spread = css`calc(${$.mode.global.shadow.spread} * 1px * pow(2, ${level} - 1))`;
	const color = css`oklch(from ${$.mode.shadow.color} l c h / 0.15)`;
	return {
		$root: css`
			${x} ${y} ${blur} ${spread} ${color}
		`,
		x,
		y,
		blur,
		spread,
		color,
	} satisfies ModeValues<ArborModeSchema['shadow']['lg']>;
}

export function createSpacingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function spacingForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}${$.mode.global.spacing.baseSize} * pow(${$.mode.global.spacing.scaleBase}, ${level} * ${$.mode.global.spacing.scaleExponentStep}) / ${$.mode.global.spacing.density}${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.spacing.md,
		xs: spacingForLevel(-2),
		sm: spacingForLevel(-1),
		md: spacingForLevel(0),
		lg: spacingForLevel(1),
		xl: spacingForLevel(2),
	} satisfies ModeValues<ArborModeSchema['spacing']>;
}

export function createShadowSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		// --m-shadow => --m-shadow-md
		$root: css`
			${$.mode.shadow.md.$root}
		`,
		color: css`
			${$.mode.color.neutral.heavy}
		`,
		none: {
			$root: '0 0 0 0 transparent',
			x: '0',
			y: '0',
			blur: '0',
			spread: '0',
			color: 'transparent',
		},
		sm: createShadowLevelSemanticValues($, 0),
		md: createShadowLevelSemanticValues($, 1),
		lg: createShadowLevelSemanticValues($, 2),
		xl: createShadowLevelSemanticValues($, 3),
	} satisfies ModeValues<ArborModeSchema['shadow']>;
}

export function createColorSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	options: CompileColorsOptions<TColorName> & {
		mainColor: string;
	},
) {
	return {
		main: $.mode.color.palette[
			options.mainColor as keyof Tokens<TColorName>['mode']['color']['palette']
		] as any,
		neutral: $.mode.color.main.$neutral,
		palette: compileColors(options, $.mode.global),
	} satisfies ModeValues<ArborModeSchema['color']>;
}

export function createRadiusSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.radius.md,
		xs: css`calc(${$.mode.global.shape.roundness} * ${$.mode.spacing.sm} / ${$.mode.global.spacing.density})`,
		sm: css`calc(${$.mode.global.shape.roundness} * ${$.mode.spacing.md} / ${$.mode.global.spacing.density})`,
		md: css`calc(${$.mode.global.shape.roundness} * ${$.mode.spacing.lg} / ${$.mode.global.spacing.density})`,
		lg: css`calc(${$.mode.global.shape.roundness} * ${$.mode.spacing.xl} / ${$.mode.global.spacing.density})`,
	} satisfies ModeValues<ArborModeSchema['radius']>;
}

export function createLineWidthSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.lineWidth.md,
		sm: css`calc(max(1px, ${$.mode.global.shape.lineWidth} * 1px / 2))`,
		md: css`calc(${$.mode.global.shape.lineWidth} * 1px)`,
		lg: css`calc(${$.mode.global.shape.lineWidth} * 2px)`,
	} satisfies ModeValues<ArborModeSchema['lineWidth']>;
}

export function createEasingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	function easingForLevel(level: number) {
		const bounciness = css`calc(${$.mode.global.easing.bounciness} * 0.5 * pow(2, ${level}))`;
		return css`cubic-bezier(0.4 - ${bounciness}, 0, 0.2 + ${bounciness}, 1)`;
	}
	return {
		$root: $.mode.easing.medium,
		tight: easingForLevel(-1),
		medium: easingForLevel(0),
		loose: easingForLevel(1),
	} satisfies ModeValues<ArborModeSchema['easing']>;
}

export function createDurationSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	function durationForLevel(level: number) {
		return css`calc(${$.mode.global.duration.base} * pow(2, ${level} * ${$.mode.global.duration.slowness}))`;
	}
	return {
		$root: $.mode.duration.medium,
		short: durationForLevel(-1),
		medium: durationForLevel(0),
		long: durationForLevel(1),
	} satisfies ModeValues<ArborModeSchema['duration']>;
}

function createTypographyWeightSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	const darkModeAdjustment = css`calc(-1 * ${$.mode.global.whenDark} * ${$.mode.global.typography.darkModeWeightAdjustment})`;
	const weightRange = css`calc(${$.mode.global.typography.maxWeight} - ${$.mode.global.typography.minWeight})`;
	const generalAdjustment = css`calc(${$.mode.global.typography.boldness} * ${weightRange} - (${weightRange} / 2) + ${darkModeAdjustment})`;

	return {
		$root: $.mode.typography.weight.normal,
		thin: css`calc(clamp(${$.mode.global.typography.minWeight}, ${$.mode.global.typography.baseWeight} - (${$.mode.global.typography.weightStep}) + ${generalAdjustment}, ${$.mode.global.typography.maxWeight}))`,
		normal: css`calc(clamp(${$.mode.global.typography.minWeight}, ${$.mode.global.typography.baseWeight} + ${generalAdjustment}, ${$.mode.global.typography.maxWeight}))`,
		bold: css`calc(clamp(${$.mode.global.typography.minWeight}, ${$.mode.global.typography.baseWeight} + (${$.mode.global.typography.weightStep}) + ${generalAdjustment}, ${$.mode.global.typography.maxWeight}))`,
	};
}

function createTypographySizeSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function sizeForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minFontSize}, 1rem * ${$.mode.global.typography.size} * pow(${$.mode.global.typography.fontSizeScaleBase}, ${level} * ${$.mode.global.typography.fontSizeScaleExponentStep}), ${$.mode.global.typography.maxFontSize})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.typography.size.md,
		sm: sizeForLevel(-1),
		md: sizeForLevel(0),
		lg: sizeForLevel(1),
	} satisfies ModeValues<ArborModeSchema['typography']['size']>;
}

function createTypographyLineHeightSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function lineHeightForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minLineHeight}, ${$.mode.global.typography.baseLineHeight} + ((${level} + (1 - ${$.mode.global.typography.size}) / 2) * ${$.mode.global.typography.lineHeightStep}), ${$.mode.global.typography.maxLineHeight})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.typography.lineHeight.normal,
		tight: lineHeightForLevel(-1),
		normal: lineHeightForLevel(0),
		loose: lineHeightForLevel(1),
	} satisfies ModeValues<ArborModeSchema['typography']['lineHeight']>;
}

function createTypographyLetterSpacingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function letterSpacingForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minLetterSpacing}, ${$.mode.global.typography.baseLetterSpacing} + (${level} * ${$.mode.global.typography.letterSpacingStep}), ${$.mode.global.typography.maxLetterSpacing})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.typography.letterSpacing.normal,
		tight: letterSpacingForLevel(-1),
		normal: letterSpacingForLevel(0),
		loose: letterSpacingForLevel(1),
	} satisfies ModeValues<ArborModeSchema['typography']['letterSpacing']>;
}

export function createTypographySemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	{ roundToPixel = false } = {},
) {
	return {
		weight: createTypographyWeightSemanticValues($),
		size: createTypographySizeSemanticValues($, { roundToPixel }),
		lineHeight: createTypographyLineHeightSemanticValues($, { roundToPixel }),
		letterSpacing: createTypographyLetterSpacingSemanticValues($, {
			roundToPixel,
		}),
	} satisfies ModeValues<ArborModeSchema['typography']>;
}
