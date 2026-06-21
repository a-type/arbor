import { css } from '@arbor-css/css-eval';
import { ModeValues } from '@arbor-css/modes';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';
import { Tokens } from './types.js';

export function createActionIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		padding: {
			$root: css`
				${$.mode.action.padding.block} ${$.mode.action.padding.inline}
			`,
			block: css`calc(${$.mode.spacing.md} / ${$.mode.global.spacing.density})`,
			inline: css`calc((${$.mode.spacing.lg} + ${$.mode.global.shape.roundness} * ${$.mode.spacing.sm}) / ${$.mode.global.spacing.density})`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.action.roundness} * ${$.mode.global.shape.roundness})`,
		primary: {
			bg: css`
				${$.mode.color.main.mid}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			borderColor: css`
				${$.mode.color.main.heavy}
			`,
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.action.primary.borderWidth} ${$.mode.action.primary
					.borderStyle} ${$.mode.action.primary.borderColor}
			`,
		},
		secondary: {
			bg: css`
				${$.mode.color.neutral.paper}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			borderColor: css`
				${$.mode.color.neutral.heavy}
			`,
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.action.secondary.borderWidth} ${$.mode.action.secondary
					.borderStyle} ${$.mode.action.secondary.borderColor}
			`,
		},
		ambient: {
			bg: 'transparent',
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			borderColor: 'transparent',
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.action.ambient.borderWidth} ${$.mode.action.ambient
					.borderStyle} ${$.mode.action.ambient.borderColor}
			`,
		},
	} satisfies ModeValues<ArborModeSchema['action']>;
}

export function createSurfaceIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		padding: {
			$root: css`
				${$.mode.surface.padding.block} ${$.mode.surface.padding.inline}
			`,
			block: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.mode.global.shape.roundness}))`,
			inline: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.mode.global.shape.roundness}))`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.surface.roundness} * ${$.mode.global.shape.roundness})`,
		primary: {
			bg: css`
				${$.mode.color.main.light}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			borderColor: css`
				${$.mode.color.main.heavy}
			`,
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.surface.primary.borderWidth} ${$.mode.surface.primary
					.borderStyle} ${$.mode.surface.primary.borderColor}
			`,
		},
		secondary: {
			bg: css`
				${$.mode.color.main.wash}
			`,
			fg: css`
				${$.mode.color.neutral.ink}
			`,
			borderColor: css`
				${$.mode.color.neutral.heavy}
			`,
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.surface.secondary.borderWidth} ${$.mode.surface.secondary
					.borderStyle} ${$.mode.surface.secondary.borderColor}
			`,
		},
		ambient: {
			bg: css`
				${$.mode.color.neutral.paper}
			`,
			fg: css`
				${$.mode.color.neutral.ink}
			`,
			borderColor: css`
				${$.mode.color.neutral.heavy}
			`,
			borderWidth: css`
				${$.mode.lineWidth.$root}
			`,
			borderStyle: 'solid',
			border: css`
				${$.mode.surface.ambient.borderWidth} ${$.mode.surface.ambient
					.borderStyle} ${$.mode.surface.ambient.borderColor}
			`,
		},
	} satisfies ModeValues<ArborModeSchema['surface']>;
}

export function createControlIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		padding: {
			$root: css`
				${$.mode.control.padding.block} ${$.mode.control.padding.inline}
			`,
			block: css`calc(${$.mode.spacing.md} / ${$.mode.global.spacing.density})`,
			inline: css`calc((${$.mode.spacing.md} + ${$.mode.global.shape.roundness} * ${$.mode.spacing.sm}) / ${$.mode.global.spacing.density})`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.control.roundness} * ${$.mode.global.shape.roundness})`,
		bg: css`
			${$.mode.color.neutral.paper}
		`,
		fg: css`
			${$.mode.color.neutral.ink}
		`,
		borderColor: css`
			${$.mode.color.neutral.heavy}
		`,
		borderWidth: css`
			${$.mode.lineWidth.$root}
		`,
		borderStyle: 'solid',
		border: css`
			${$.mode.control.borderWidth} ${$.mode.control.borderStyle} ${$.mode
				.control.borderColor}
		`,
	} satisfies ModeValues<ArborModeSchema['control']>;
}

export function createTextIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		primary: {
			size: $.mode.typography.size.lg,
			lineHeight: $.mode.typography.lineHeight.tight,
			letterSpacing: $.mode.typography.letterSpacing.normal,
			weight: $.mode.typography.weight.bold,
			font: 'inherit',
		},
		secondary: {
			size: $.mode.typography.size.md,
			lineHeight: $.mode.typography.lineHeight.normal,
			letterSpacing: $.mode.typography.letterSpacing.normal,
			weight: $.mode.typography.weight.normal,
			font: 'inherit',
		},
		ambient: {
			size: $.mode.typography.size.sm,
			lineHeight: $.mode.typography.lineHeight.loose,
			letterSpacing: $.mode.typography.letterSpacing.normal,
			weight: $.mode.typography.weight.normal,
			font: 'inherit',
		},
	} satisfies ModeValues<ArborModeSchema['text']>;
}
