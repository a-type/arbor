import { css } from '@arbor-css/css-eval';
import { ModeValues } from '@arbor-css/modes';
import { ModeSchema } from '../schema/schema.js';
import { Tokens } from './types.js';

export function createActionIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		config: {
			roundness: 1,
		},
		p: {
			$root: css`
				${$.mode.action.p.block} ${$.mode.action.p.inline}
			`,
			block: css`
				${$.mode.sp.md}
			`,
			inline: css`calc(${$.mode.sp.lg} + ${$.mode.global.shape.roundness} * ${$.mode.sp.sm})`,
		},
		rd: css`calc(${$.mode.rd.md} * ${$.mode.action.config.roundness} * ${$.mode.global.shape.roundness})`,
		text: {
			font: 'inherit',
			letterSpacing: css`
				${$.mode.prose.secondary.letterSpacing}
			`,
			lineHeight: css`1`,
			size: css`
				${$.mode.prose.secondary.size}
			`,
			weight: css`
				${$.mode.fw.bold}
			`,
		},
		primary: {
			bg: css`
				${$.mode.bg.bold}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			b: {
				$root: css`
					${$.mode.action.primary.b.width} ${$.mode.action.primary.b.style} ${$
						.mode.action.primary.b.color}
				`,
				color: css`
					${$.mode.fg.$root}
				`,
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
		secondary: {
			bg: css`
				${$.mode.bg.paper}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			b: {
				$root: css`
					${$.mode.action.secondary.b.width} ${$.mode.action.secondary.b
						.style} ${$.mode.action.secondary.b.color}
				`,
				color: css`
					${$.mode.fg.gray.light}
				`,
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
		ambient: {
			bg: 'transparent',
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			b: {
				$root: css`
					${$.mode.action.ambient.b.width} ${$.mode.action.ambient.b.style} ${$
						.mode.action.ambient.b.color}
				`,
				color: 'transparent',
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
	} satisfies ModeValues<ModeSchema['action']>;
}

export function createSurfaceIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		config: { roundness: 1 },
		p: {
			$root: css`
				${$.mode.surface.p.block} ${$.mode.surface.p.inline}
			`,
			block: css`calc(${$.mode.sp.lg} * max(1, ${$.mode.surface.config.roundness} * ${$.mode.global.shape.roundness}))`,
			inline: css`calc(${$.mode.sp.lg} * max(1, ${$.mode.surface.config.roundness} * ${$.mode.global.shape.roundness}))`,
		},
		rd: css`calc(${$.mode.rd.md} * ${$.mode.surface.config.roundness} * ${$.mode.global.shape.roundness})`,
		text: {
			font: 'inherit',
			letterSpacing: css`
				${$.mode.prose.secondary.letterSpacing}
			`,
			lineHeight: css`
				${$.mode.prose.secondary.lineHeight}
			`,
			size: css`
				${$.mode.prose.secondary.size}
			`,
			weight: css`
				${$.mode.prose.secondary.weight}
			`,
		},
		primary: {
			bg: css`
				${$.mode.bg.light}
			`,
			fg: css`
				${$.mode.global.trueHeavyColor}
			`,
			b: {
				$root: css`
					${$.mode.surface.primary.b.width} ${$.mode.surface.primary.b
						.style} ${$.mode.surface.primary.b.color}
				`,
				color: css`
					${$.mode.fg.light}
				`,
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
		secondary: {
			bg: css`
				${$.mode.bg.wash}
			`,
			fg: css`
				${$.mode.fg.ink}
			`,
			b: {
				$root: css`
					${$.mode.surface.secondary.b.width} ${$.mode.surface.secondary.b
						.style} ${$.mode.surface.secondary.b.color}
				`,
				color: css`
					${$.mode.fg.light}
				`,
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
		ambient: {
			bg: css`
				${$.mode.bg.gray.paper}
			`,
			fg: css`
				${$.mode.fg.gray.ink}
			`,
			b: {
				$root: css`
					${$.mode.surface.ambient.b.width} ${$.mode.surface.ambient.b
						.style} ${$.mode.surface.ambient.b.color}
				`,
				color: css`
					${$.mode.fg.gray.light}
				`,
				width: css`
					${$.mode.lw.$root}
				`,
				style: 'solid',
			},
		},
	} satisfies ModeValues<ModeSchema['surface']>;
}

export function createControlIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		config: {
			roundness: 1,
		},
		p: {
			$root: css`
				${$.mode.control.p.block} ${$.mode.control.p.inline}
			`,
			block: css`
				${$.mode.sp.md}
			`,
			inline: css`calc(${$.mode.sp.md} + ${$.mode.global.shape.roundness} * ${$.mode.sp.sm})`,
		},
		rd: css`calc(${$.mode.rd.md} * ${$.mode.control.config.roundness} * ${$.mode.global.shape.roundness})`,
		bg: css`
			${$.mode.bg.gray.paper}
		`,
		fg: css`
			${$.mode.fg.gray.ink}
		`,
		b: {
			$root: css`
				${$.mode.control.b.width} ${$.mode.control.b.style} ${$.mode.control.b
					.color}
			`,
			color: css`
				${$.mode.fg.gray.light}
			`,
			width: css`
				${$.mode.lw.$root}
			`,
			style: 'solid',
		},
		text: {
			font: 'inherit',
			letterSpacing: css`
				${$.mode.ls.normal}
			`,
			lineHeight: css`
			1
		`,
			size: css`
				${$.mode.prose.secondary.size}
			`,
			weight: css`
				${$.mode.fw.normal}
			`,
		},
	} satisfies ModeValues<ModeSchema['control']>;
}

export function createProseIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		primary: {
			size: $.mode.fs.lg,
			lineHeight: $.mode.lh.tight,
			letterSpacing: $.mode.ls.normal,
			weight: $.mode.fw.bold,
			font: 'inherit',
		},
		secondary: {
			size: $.mode.fs.md,
			lineHeight: $.mode.lh.normal,
			letterSpacing: $.mode.ls.normal,
			weight: $.mode.fw.normal,
			font: 'inherit',
		},
		ambient: {
			size: $.mode.fs.sm,
			lineHeight: $.mode.lh.loose,
			letterSpacing: $.mode.ls.normal,
			weight: $.mode.fw.normal,
			font: 'inherit',
		},
	} satisfies ModeValues<ModeSchema['prose']>;
}

export function createFgIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	$.mode.tint;
	return {
		$root: css`
			${$.mode.fg.ink}
		`,
		ink: css`
			${$.mode.tint.ink}
		`,
		light: css`
			${$.mode.tint.heavy}
		`,
		gray: {
			$root: css`
				${$.mode.fg.gray.ink}
			`,
			ink: css`
				${$.mode.gray.ink}
			`,
			light: css`
				${$.mode.gray.heavy}
			`,
		},
	} satisfies ModeValues<ModeSchema['fg']>;
}

export function createBgIntentValues<TColorNames extends string>(
	$: Tokens<TColorNames>,
) {
	return {
		$root: css`
			${$.mode.bg.paper}
		`,
		paper: css`
			${$.mode.tint.paper}
		`,
		wash: css`
			${$.mode.tint.wash}
		`,
		light: css`
			${$.mode.tint.light}
		`,
		bold: css`
			${$.mode.tint.mid}
		`,
		gray: {
			$root: css`
				${$.mode.bg.gray.paper}
			`,
			paper: css`
				${$.mode.gray.paper}
			`,
			wash: css`
				${$.mode.gray.wash}
			`,
			light: css`
				${$.mode.gray.light}
			`,
			bold: css`
				${$.mode.gray.mid}
			`,
		},
	} satisfies ModeValues<ModeSchema['bg']>;
}
