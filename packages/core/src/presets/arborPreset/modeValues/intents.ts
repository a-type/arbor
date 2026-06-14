import { css } from '@arbor-css/calc';
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
			block: css`calc(${$.mode.primitive.spacing.md} / ${$.mode.global.density})`,
			inline: css`calc((${$.mode.primitive.spacing.lg} + ${$.mode.global.roundness} * ${$.mode.primitive.spacing.sm}) / ${$.mode.global.density})`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.action.roundness})`,
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
			block: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.mode.global.roundness}))`,
			inline: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.mode.global.roundness}))`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.surface.roundness})`,
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
			block: css`calc(${$.mode.primitive.spacing.md} / ${$.mode.global.density})`,
			inline: css`calc((${$.mode.primitive.spacing.md} + ${$.mode.global.roundness} * ${$.mode.primitive.spacing.sm}) / ${$.mode.global.density})`,
		},
		roundness: 1,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.control.roundness})`,
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
			...$.mode.primitive.typography['xl'],
			weight: $.mode.primitive.typography.weight.bold,
			font: 'inherit',
		},
		secondary: {
			...$.mode.primitive.typography.md,
			weight: $.mode.primitive.typography.weight.normal,
			font: 'inherit',
		},
		ambient: {
			...$.mode.primitive.typography.sm,
			weight: $.mode.primitive.typography.weight.normal,
			font: 'inherit',
		},
	} satisfies ModeValues<ArborModeSchema['text']>;
}
