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
			block: css`calc(${$.mode.primitive.spacing.md} / ${$.mode.scalar.density})`,
			inline: css`calc((${$.mode.primitive.spacing.lg} + ${$.system.global.roundness} * ${$.mode.primitive.spacing.sm}) / ${$.mode.scalar.density})`,
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
			block: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.system.global.roundness}))`,
			inline: css`calc(${$.mode.spacing.lg} * max(1, ${$.mode.surface.roundness} * ${$.system.global.roundness}))`,
		},
		roundness: 0.75,
		radius: css`calc(${$.mode.radius.md} * ${$.mode.surface.roundness})`,
		primary: {
			bg: css`
				${$.mode.color.main.light}
			`,
			fg: css`
				${$.mode.color.neutral.ink}
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
			block: css`calc(${$.mode.primitive.spacing.sm} / ${$.mode.scalar.density})`,
			inline: css`calc((${$.mode.primitive.spacing.md} + ${$.system.global.roundness} * ${$.mode.primitive.spacing.sm}) / ${$.mode.scalar.density})`,
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
			size: css`calc(${$.mode.primitive.typography['3xl'].size} / ${$.mode.scalar.density})`,
			weight: $.mode.primitive.typography['3xl'].weight,
			lineHeight: $.mode.primitive.typography['3xl'].lineHeight,
			font: 'sans-serif',
		},
		secondary: {
			size: css`calc(max(${$.mode.primitive.typography.xs.size}, ${$.mode.primitive.typography.md.size} / ${$.mode.scalar.density}))`,
			weight: $.mode.primitive.typography.md.weight,
			lineHeight: $.mode.primitive.typography.md.lineHeight,
			font: 'sans-serif',
		},
		ambient: {
			size: css`calc(max(${$.mode.primitive.typography.xs.size}, ${$.mode.primitive.typography.sm.size} / ${$.mode.scalar.density}))`,
			weight: $.mode.primitive.typography.sm.weight,
			lineHeight: $.mode.primitive.typography.sm.lineHeight,
			font: 'sans-serif',
		},
	} satisfies ModeValues<ArborModeSchema['text']>;
}
