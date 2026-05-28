import { css } from '@arbor-css/calc';
import { CompiledColors } from '@arbor-css/colors';
import { PresetMixins } from '@arbor-css/functions';
import { ModeValues } from '@arbor-css/modes';
import { PresetTokens } from '@arbor-css/preset';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { CompiledTypography } from '@arbor-css/typography';
import { ArborModeSchema } from './modeSchema.js';

type Tokens = PresetTokens<
	ArborModeSchema,
	CompiledColors,
	CompiledTypography,
	CompiledSpacing,
	Record<string, string>,
	Record<string, string>,
	CompiledShadows,
	PresetMixins,
	[]
>;

function createShadowIntentLevel($: Tokens, size: 'sm' | 'md' | 'lg' | 'xl') {
	return {
		$root: css`
			${$.mode.shadow[size].x} ${$.mode.shadow[size].y} ${$.mode.shadow[size]
				.blur} ${$.mode.shadow[size].spread} ${$.mode.shadow[size].color}
		`,
		x: css`
			${$.primitives.shadow[size].x}
		`,
		y: css`
			${$.primitives.shadow[size].y}
		`,
		blur: css`
			${$.primitives.shadow[size].blur}
		`,
		spread: css`
			${$.primitives.shadow[size].spread}
		`,
		color: css`oklch(from ${[
			$.mode.shadow.color,
			$.primitives.shadow[size].color,
		]} l c h / 15%)`,
	} satisfies ModeValues<ArborModeSchema['shadow']['lg']>;
}

export function createArborModeValues<
	TCompiledColors extends CompiledColors,
>(config: {
	mainColor: keyof TCompiledColors[keyof TCompiledColors]['colors'];
	tokens: Tokens;
}): ModeValues<ArborModeSchema> {
	const mainColor: any = config.tokens.primitives.color[config.mainColor];
	const spacingRoot = config.tokens.primitives.spacing.$root ?? '1rem';
	const shadowRoot = config.tokens.primitives.shadow.$root;
	const $ = config.tokens;

	return {
		color: {
			main: mainColor,
			neutral: mainColor.$neutral,
		},
		surface: {
			padding: {
				$root: css`
					${$.mode.surface.padding.block} ${$.mode.surface.padding.inline}
				`,
				block: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.system.global.roundness}))`,
				inline: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.system.global.roundness}))`,
			},
			roundness: 1,
			radius: css`calc(${$.mode.radius.md} * ${$.mode.surface.roundness})`,
			primary: {
				bg: css`
					${$.mode.color.main.light}
				`,
				fg: css`
					${$.mode.color.main.ink}
				`,
				border: css`
					${$.mode.color.main.heavy}
				`,
			},
			secondary: {
				bg: css`
					${$.mode.color.main.wash}
				`,
				fg: css`
					${$.mode.color.neutral.ink}
				`,
				border: css`
					${$.mode.color.main.ink}
				`,
			},
			ambient: {
				bg: css`
					${$.mode.color.neutral.paper}
				`,
				fg: css`
					${$.mode.color.neutral.ink}
				`,
				border: css`
					${$.mode.color.neutral.heavy}
				`,
			},
		},
		action: {
			padding: {
				$root: css`
					${$.mode.action.padding.block} ${$.mode.action.padding.inline}
				`,
				block: css`calc(${$.primitives.spacing.md} / ${$.mode.density})`,
				inline: css`calc((${$.primitives.spacing.lg} + ${$.system.global.roundness} * ${$.primitives.spacing.sm}) / ${$.mode.density})`,
			},
			roundness: 1,
			radius: css`calc(${$.mode.radius.sm} * ${$.mode.action.roundness})`,
			primary: {
				bg: css`
					${$.mode.color.main.mid}
				`,
				fg: css`
					${$.mode.color.main.ink}
				`,
				border: css`
					${$.mode.color.main.heavy}
				`,
			},
			secondary: {
				bg: css`
					${$.mode.color.neutral.paper}
				`,
				fg: css`
					${$.mode.color.neutral.ink}
				`,
				border: css`
					${$.mode.color.neutral.heavy}
				`,
			},
			ambient: {
				bg: 'transparent',
				fg: css`
					${$.mode.color.main.ink}
				`,
				border: 'transparent',
			},
		},
		control: {
			padding: {
				$root: css`
					${$.mode.control.padding.block} ${$.mode.control.padding.inline}
				`,
				block: css`calc(${$.primitives.spacing.sm} / ${$.mode.density})`,
				inline: css`calc((${$.primitives.spacing.sm} + ${$.system.global.roundness} * ${$.primitives.spacing.xs}) / ${$.mode.density})`,
			},
			roundness: 1,
			radius: css`calc(${$.mode.radius.sm} * ${$.mode.control.roundness})`,
			bg: css`
				${$.mode.color.neutral.paper}
			`,
			fg: css`
				${$.mode.color.neutral.ink}
			`,
			border: css`
				${$.mode.color.neutral.heavy}
			`,
		},
		density: 1,
		spacing: {
			$root: css`calc(${spacingRoot} / ${$.mode.density})`,
			xs: css`calc(${$.primitives.spacing.xs} / ${$.mode.density})`,
			sm: css`calc(${$.primitives.spacing.sm} / ${$.mode.density})`,
			md: css`calc(${$.primitives.spacing.md} / ${$.mode.density})`,
			lg: css`calc(${$.primitives.spacing.lg} / ${$.mode.density})`,
			xl: css`calc(${$.primitives.spacing.xl} / ${$.mode.density})`,
		},
		text: {
			primary: {
				size: css`calc(${$.primitives.typography['3xl'].size} / ${$.mode.density})`,
				weight: $.primitives.typography['3xl'].weight,
				lineHeight: $.primitives.typography['3xl'].lineHeight,
				font: 'sans-serif',
			},
			secondary: {
				size: css`calc(max(${$.primitives.typography.xs.size}, ${$.primitives.typography.md.size} / ${$.mode.density}))`,
				weight: $.primitives.typography.md.weight,
				lineHeight: $.primitives.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: css`calc(max(${$.primitives.typography.xs.size}, ${$.primitives.typography.sm.size} / ${$.mode.density}))`,
				weight: $.primitives.typography.sm.weight,
				lineHeight: $.primitives.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		radius: {
			$root: css`
				${$.mode.radius.md}
			`,
			xs: css`calc(${$.system.global.roundness} * ${$.primitives.spacing.sm} * 2 / ${$.mode.density})`,
			sm: css`calc(${$.system.global.roundness} * ${$.primitives.spacing.md} * 2 / ${$.mode.density})`,
			md: css`calc(${$.system.global.roundness} * ${$.primitives.spacing.lg} * 2 / ${$.mode.density})`,
			lg: css`calc(${$.system.global.roundness} * ${$.primitives.spacing.xl} * 2 / ${$.mode.density})`,
			xl: css`calc(${$.system.global.roundness} * ${$.primitives.spacing['2xl']} * 2 / ${$.mode.density})`,
		},
		lineWidth: {
			$root: css`
				${$.system.global.lineWidth}
			`,
			sm: css`calc(max(1px, ${$.system.global.lineWidth} / 2))`,
			md: css`
				${$.system.global.lineWidth}
			`,
			lg: css`calc(${$.system.global.lineWidth} * 2)`,
		},
		shadow: {
			$root: css`
				${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}
			`,
			color: css`
				${$.mode.color.neutral.heavy}
			`,
			sm: createShadowIntentLevel($, 'sm'),
			md: createShadowIntentLevel($, 'md'),
			lg: createShadowIntentLevel($, 'lg'),
			xl: createShadowIntentLevel($, 'xl'),
		},
		easing: {
			$root: css`
				${$.primitives.easing.medium}
			`,
			tight: css`
				${$.primitives.easing.tight}
			`,
			medium: css`
				${$.primitives.easing.medium}
			`,
			loose: css`
				${$.primitives.easing.loose}
			`,
		},
		duration: {
			$root: css`
				${$.primitives.duration.medium}
			`,
			fast: css`
				${$.primitives.duration.fast}
			`,
			medium: css`
				${$.primitives.duration.medium}
			`,
			slow: css`
				${$.primitives.duration.slow}
			`,
		},
	} satisfies ModeValues<ArborModeSchema>;
}
