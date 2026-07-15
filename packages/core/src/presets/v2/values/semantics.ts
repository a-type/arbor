import { css } from '@arbor-css/css-eval';
import { ModeValues } from '@arbor-css/modes';
import { ModeSchema } from '../schema/schema.js';
import { compileColors, CompileColorsOptions } from './color/compile.js';
import { Tokens } from './types.js';

export function createShadowLevelSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	level: number,
) {
	const x = css`0px`;
	const y = css`calc(1px * pow(3, ${level}))`;
	const blur = css`calc(${$.mode.global.shadow.blur} * ${$.mode.global.space.baseSize} * 0.25 * pow(2, ${level} - 1))`;
	const spread = css`calc(${$.mode.global.shadow.spread} * 1px * pow(2, ${level} - 1))`;
	const color = css`oklch(from ${$.mode.global.shadow.color} l c h / 0.15)`;
	return {
		$root: css`
			${x} ${y} ${blur} ${spread} ${color}
		`,
		x,
		y,
		blur,
		spread,
		color,
	} satisfies ModeValues<ModeSchema['shadow']['lg']>;
}

export function createSpacingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function spacingForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}${$.mode.global.space.baseSize} * pow(${$.mode.global.space.scaleBase}, ${level} * ${$.mode.global.space.scaleExponentStep}) / ${$.mode.global.space.density}${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.sp.md,
		xs: spacingForLevel(-2),
		sm: spacingForLevel(-1),
		md: spacingForLevel(0),
		lg: spacingForLevel(1),
		xl: spacingForLevel(2),
	} satisfies ModeValues<ModeSchema['sp']>;
}

export function createShadowSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		// --m-shadow => --m-shadow-md
		$root: css`
			${$.mode.shadow.md.$root}
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
	} satisfies ModeValues<ModeSchema['shadow']>;
}

export function createColorSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	options: CompileColorsOptions<TColorName> & {
		mainColor: string;
	},
) {
	const palette = compileColors(options, $.mode.global);
	return palette as unknown as ModeValues<ModeSchema['color']>;
}

export function createRadiusSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.rd.md,
		xs: css`calc(${$.mode.global.shape.roundness} * ${$.mode.sp.xs})`,
		sm: css`calc(${$.mode.global.shape.roundness} * ${$.mode.sp.sm})`,
		md: css`calc(${$.mode.global.shape.roundness} * ${$.mode.sp.md})`,
		lg: css`calc(${$.mode.global.shape.roundness} * ${$.mode.sp.lg})`,
		xl: css`calc(${$.mode.global.shape.roundness} * ${$.mode.sp.xl})`,
		full: css`9999px`,
	} satisfies ModeValues<ModeSchema['rd']>;
}

export function createLineWidthSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.lw.md,
		sm: css`calc(max(1px, ${$.mode.global.shape.lineWidth} * 1px / 2))`,
		md: css`calc(${$.mode.global.shape.lineWidth} * 1px)`,
		lg: css`calc(${$.mode.global.shape.lineWidth} * 2px)`,
	} satisfies ModeValues<ModeSchema['lw']>;
}

export function createEasingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	function easingForLevel(level: number) {
		// x-axis positions control the tight/loose shape (JS constants, not CSS variables)
		const x1 = 0.55 + level * 0.15; // 0.40 / 0.55 / 0.70
		const x2 = Math.max(0.04, 0.1 - level * 0.05); // 0.15 / 0.10 / 0.05
		// Spring is zero at the default bounciness of 0.5, grows above it.
		// Scale factors are 2x vs the target spring at b=1 so the threshold shift preserves that feel.
		const springScale = (0.2 + level * 0.1) * 2; // 0.20 / 0.40 / 0.60
		const b = $.mode.global.ease.bounciness;
		const spring = css`max(0, ${b} - 0.5) * ${springScale}`;
		const y1 = css`calc(0 - ${spring})`;
		const y2 = css`calc(1 + ${spring} * 2)`;
		return css`cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
	}
	function easingInForLevel(level: number) {
		// x1 controls depth of the ease-in; larger = slower start
		const x1 = 0.4 + level * 0.2; // 0.20 / 0.40 / 0.60
		// Spring creates a slight anticipation (backward pull) at the start
		const springScale = (0.15 + level * 0.05) * 2; // 0.20 / 0.30 / 0.40
		const b = $.mode.global.ease.bounciness;
		const anticipation = css`calc(0 - max(0, ${b} - 0.5) * ${springScale})`;
		return css`cubic-bezier(${x1}, ${anticipation}, 1, 1)`;
	}
	function easingOutForLevel(level: number) {
		const x1 = 0.2 + level * 0.1; // 0.10 / 0.20 / 0.30
		const x2 = 0.55 + level * 0.1; // 0.45 / 0.55 / 0.65
		// Scale factors are 2x so that at b=1 the spring matches the original intent.
		const springScale = 0.55 * Math.pow(2, level) * 2; // 0.55 / 1.10 / 2.20
		const b = $.mode.global.ease.bounciness;
		const overshoot = css`calc(1 + max(0, ${b} - 0.5) * ${springScale})`;
		return css`cubic-bezier(${x1}, ${overshoot}, ${x2}, 1)`;
	}
	return {
		$root: $.mode.ease.medium,
		tight: easingForLevel(1),
		medium: easingForLevel(0),
		loose: easingForLevel(-1),
		in: {
			$root: $.mode.ease.in.medium,
			tight: easingInForLevel(1),
			medium: easingInForLevel(0),
			loose: easingInForLevel(-1),
		},
		out: {
			$root: $.mode.ease.out.medium,
			tight: easingOutForLevel(1),
			medium: easingOutForLevel(0),
			loose: easingOutForLevel(-1),
		},
	} satisfies ModeValues<ModeSchema['ease']>;
}

export function createDurationSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	function durationForLevel(level: number) {
		return css`calc(${$.mode.global.duration.base} * pow(2, ${level}) * ${$.mode.global.duration.slowness})`;
	}
	return {
		$root: $.mode.dur.medium,
		short: durationForLevel(-1),
		medium: durationForLevel(0),
		long: durationForLevel(1),
	} satisfies ModeValues<ModeSchema['dur']>;
}

export function createTypographyWeightSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	const darkModeAdjustment = css`calc(-1 * ${$.mode.global.whenDark} * ${$.mode.global.typography.darkModeWeightAdjustment})`;
	const weightRange = css`calc(${$.mode.global.typography.maxWeight} - ${$.mode.global.typography.minWeight})`;
	const generalAdjustment = css`calc(${$.mode.global.typography.boldness} * ${weightRange} - (${weightRange} / 2) + ${darkModeAdjustment})`;

	return {
		$root: $.mode.fw.normal,
		normal: css`calc(clamp(${$.mode.global.typography.minWeight}, ${$.mode.global.typography.baseWeight} + ${generalAdjustment}, ${$.mode.global.typography.maxWeight}))`,
		bold: css`calc(clamp(${$.mode.global.typography.minWeight}, ${$.mode.global.typography.baseWeight} + (${$.mode.global.typography.weightStep}) + ${generalAdjustment}, ${$.mode.global.typography.maxWeight}))`,
	} satisfies ModeValues<ModeSchema['fw']>;
}

export function createTypographySizeSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	config: { roundToPixel?: boolean },
) {
	function sizeForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minFontSize}, 1rem * ${$.mode.global.typography.size} * pow(${$.mode.global.typography.fontSizeScaleBase}, ${level} * ${$.mode.global.typography.fontSizeScaleExponentStep}), ${$.mode.global.typography.maxFontSize})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.fs.md,
		sm: sizeForLevel(-1),
		md: sizeForLevel(0),
		lg: sizeForLevel(1),
	} satisfies ModeValues<ModeSchema['fs']>;
}

export function createTypographyLineHeightSemanticValues<
	TColorName extends string,
>($: Tokens<TColorName>, config: { roundToPixel?: boolean }) {
	function lineHeightForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minLineHeight}, ${$.mode.global.typography.baseLineHeight} + ((${level} + (1 - ${$.mode.global.typography.size}) / 2) * ${$.mode.global.typography.lineHeightStep}), ${$.mode.global.typography.maxLineHeight})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.lh.normal,
		tight: lineHeightForLevel(-1),
		normal: lineHeightForLevel(0),
		loose: lineHeightForLevel(1),
	} satisfies ModeValues<ModeSchema['lh']>;
}

export function createTypographyLetterSpacingSemanticValues<
	TColorName extends string,
>($: Tokens<TColorName>, config: { roundToPixel?: boolean }) {
	function letterSpacingForLevel(level: number) {
		return css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${$.mode.global.typography.minLetterSpacing}, ${$.mode.global.typography.baseLetterSpacing} + (${level} * ${$.mode.global.typography.letterSpacingStep}), ${$.mode.global.typography.maxLetterSpacing})${config.roundToPixel ? ', 1px)' : ''})`;
	}
	return {
		$root: $.mode.ls.normal,
		tight: letterSpacingForLevel(-1),
		normal: letterSpacingForLevel(0),
		loose: letterSpacingForLevel(1),
	} satisfies ModeValues<ModeSchema['ls']>;
}
