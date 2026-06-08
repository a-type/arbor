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
		radius: css`calc(${$.mode.radius.sm} * ${$.mode.action.roundness})`,
		primary: {
			bg: css`
				${$.mode.color.main.mid}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
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
				${$.mode.global.trueHeavyColor}
			`,
			border: css`
				${$.mode.color.neutral.heavy}
			`,
		},
		ambient: {
			bg: 'transparent',
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			border: 'transparent',
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
		roundness: 0.75,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.surface.roundness})`,
		primary: {
			bg: css`
				${$.mode.color.main.light}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
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
				${$.mode.color.neutral.heavy}
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
			block: css`calc(${$.mode.primitive.spacing.sm} / ${$.mode.global.density})`,
			inline: css`calc((${$.mode.primitive.spacing.md} + ${$.mode.global.roundness} * ${$.mode.primitive.spacing.sm}) / ${$.mode.global.density})`,
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
