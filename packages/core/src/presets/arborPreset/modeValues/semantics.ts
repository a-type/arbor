import { css } from '@arbor-css/calc';
import { ModeValues } from '@arbor-css/modes';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';
import { Tokens } from './types.js';

export function createShadowLevelSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
	size: 'sm' | 'md' | 'lg' | 'xl',
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
		xs: css`calc(${$.mode.primitive.spacing.xs} / ${$.mode.scalar.density})`,
		sm: css`calc(${$.mode.primitive.spacing.sm} / ${$.mode.scalar.density})`,
		md: css`calc(${$.mode.primitive.spacing.md} / ${$.mode.scalar.density})`,
		lg: css`calc(${$.mode.primitive.spacing.lg} / ${$.mode.scalar.density})`,
		xl: css`calc(${$.mode.primitive.spacing.xl} / ${$.mode.scalar.density})`,
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
		neutral: (
			$.mode.primitive.color[
				defaultColor as keyof Tokens<TColorName>['mode']['primitive']['color']
			] as any
		).$neutral,
	};
}

export function createRadiusSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.radius.md,
		xs: css`calc(${$.system.global.roundness} * ${$.mode.primitive.spacing.sm} * 2 / ${$.mode.scalar.density})`,
		sm: css`calc(${$.system.global.roundness} * ${$.mode.primitive.spacing.md} * 2 / ${$.mode.scalar.density})`,
		md: css`calc(${$.system.global.roundness} * ${$.mode.primitive.spacing.lg} * 2 / ${$.mode.scalar.density})`,
		lg: css`calc(${$.system.global.roundness} * ${$.mode.primitive.spacing.xl} * 2 / ${$.mode.scalar.density})`,
		xl: css`calc(${$.system.global.roundness} * ${$.mode.primitive.spacing['2xl']} * 2 / ${$.mode.scalar.density})`,
	} satisfies ModeValues<ArborModeSchema['radius']>;
}

export function createLineWidthSemanticValues<TColorName extends string>(
	$: Tokens<TColorName>,
) {
	return {
		$root: $.mode.lineWidth.md,
		sm: css`calc(max(1px, ${$.system.global.lineWidth} / 2))`,
		md: $.system.global.lineWidth,
		lg: css`calc(${$.system.global.lineWidth} * 2)`,
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
