import { css } from '@arbor-css/calc';
import { ModeValues } from '@arbor-css/modes';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';
import { Tokens } from './types.js';

export function createShadowLevelSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	size: 'none' | 'sm' | 'md' | 'lg' | 'xl',
) {
	return {
		$root: css`
			${$.mode.shadow[size].x} ${$.mode.shadow[size].y} ${$.mode.primitive
				.shadow[size].blur} ${$.mode.shadow[size].spread} ${$.mode.shadow[size]
				.color}
		`,
		x: css`
			${$.mode.primitive.shadow[size].x}
		`,
		y: css`
			${$.mode.primitive.shadow[size].y}
		`,
		blur: css`
			${$.mode.primitive.shadow[size].blur}
		`,
		spread: css`
			${$.mode.primitive.shadow[size].spread}
		`,
		color: css`oklch(from ${[
			$.mode.shadow.color,
			$.mode.primitive.shadow[size].color,
		]} l c h / 15%)`,
	} satisfies ModeValues<ArborModeSchema['shadow']['lg']>;
}

export function createSpacingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.spacing.md,
		xs: css`calc(${$.mode.primitive.spacing.xs} / ${$.mode.global.density})`,
		sm: css`calc(${$.mode.primitive.spacing.sm} / ${$.mode.global.density})`,
		md: css`calc(${$.mode.primitive.spacing.md} / ${$.mode.global.density})`,
		lg: css`calc(${$.mode.primitive.spacing.lg} / ${$.mode.global.density})`,
		xl: css`calc(${$.mode.primitive.spacing.xl} / ${$.mode.global.density})`,
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
		none: createShadowLevelSemanticValues($, 'none'),
		sm: createShadowLevelSemanticValues($, 'sm'),
		md: createShadowLevelSemanticValues($, 'md'),
		lg: createShadowLevelSemanticValues($, 'lg'),
		xl: createShadowLevelSemanticValues($, 'xl'),
	} satisfies ModeValues<ArborModeSchema['shadow']>;
}

export function createColorSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	defaultColor: TColorName,
) {
	return {
		main: $.mode.primitive.color[
			defaultColor as keyof Tokens<TColorName>['mode']['primitive']['color']
		],
		neutral: $.mode.color.main.$neutral,
	};
}

export function createRadiusSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.radius.md,
		xs: css`calc(${$.mode.global.roundness} * ${$.mode.primitive.spacing.sm} * 2 / ${$.mode.global.density})`,
		sm: css`calc(${$.mode.global.roundness} * ${$.mode.primitive.spacing.md} * 2 / ${$.mode.global.density})`,
		md: css`calc(${$.mode.global.roundness} * ${$.mode.primitive.spacing.lg} * 2 / ${$.mode.global.density})`,
		lg: css`calc(${$.mode.global.roundness} * ${$.mode.primitive.spacing.xl} * 2 / ${$.mode.global.density})`,
		xl: css`calc(${$.mode.global.roundness} * ${$.mode.primitive.spacing['2xl']} * 2 / ${$.mode.global.density})`,
	} satisfies ModeValues<ArborModeSchema['radius']>;
}

export function createLineWidthSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.lineWidth.md,
		sm: css`calc(max(1px, ${$.mode.global.lineWidth} * 1px / 2))`,
		md: css`calc(${$.mode.global.lineWidth} * 1px)`,
		lg: css`calc(${$.mode.global.lineWidth} * 2px)`,
	} satisfies ModeValues<ArborModeSchema['lineWidth']>;
}

export function createEasingSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.easing.medium,
		tight: css`cubic-bezier(0.6, 0, 0.4, 1)`,
		medium: css`cubic-bezier(0.4, 0, 0.2, 1)`,
		loose: css`cubic-bezier(0.2, 0, 0.0, 1)`,
	} satisfies ModeValues<ArborModeSchema['easing']>;
}

export function createDurationSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.duration.medium,
		short: css`100ms`,
		medium: css`250ms`,
		long: css`500ms`,
	} satisfies ModeValues<ArborModeSchema['duration']>;
}
