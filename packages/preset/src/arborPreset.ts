import { calc } from '@arbor-css/calc';
import { CompiledColors } from '@arbor-css/colors';
import { $globalProps } from '@arbor-css/globals';
import {
	createModeSchema,
	ModeSchemaLevel,
	ModeValues,
} from '@arbor-css/modes';
import { Primitives } from '@arbor-css/primitives';

const colorIntents = {
	fg: 'color',
	bg: 'color',
	border: 'color',
} satisfies ModeSchemaLevel;

const boxIntents = {
	$root: 'other',
	inline: 'spacing',
	block: 'spacing',
} satisfies ModeSchemaLevel;

const textIntents = {
	size: 'font-size',
	weight: 'font-weight',
	lineHeight: 'line-height',
	font: 'other',
} satisfies ModeSchemaLevel;

const shadowIntents = {
	x: 'shadow-x',
	y: 'shadow-y',
	blur: 'shadow-blur',
	spread: 'shadow-spread',
	color: 'shadow-color',
	compiled: 'shadow',
} satisfies ModeSchemaLevel;

export const arborModeSchema = createModeSchema({
	color: {
		main: {
			$root: 'color',
			paper: 'color',
			wash: 'color',
			light: 'color',
			mid: 'color',
			heavy: 'color',
			ink: 'color',
		},
		neutral: {
			$root: 'color',
			paper: 'color',
			wash: 'color',
			light: 'color',
			mid: 'color',
			heavy: 'color',
			ink: 'color',
		},
	},

	// intents
	action: {
		padding: boxIntents,
		roundness: 'other',
		borderRadius: 'border-radius',
		primary: {
			color: colorIntents,
		},
		secondary: {
			color: colorIntents,
		},
		ambient: {
			color: colorIntents,
		},
	},
	control: {
		padding: boxIntents,
		roundness: 'other',
		borderRadius: 'border-radius',
		color: colorIntents,
	},
	surface: {
		padding: boxIntents,
		roundness: 'other',
		borderRadius: 'border-radius',
		primary: {
			color: colorIntents,
		},
		secondary: {
			color: colorIntents,
		},
		ambient: {
			color: colorIntents,
		},
	},
	text: {
		primary: textIntents,
		secondary: textIntents,
		ambient: textIntents,
	},

	// density
	density: 'other',
	spacing: {
		$root: 'spacing',
		xs: 'spacing',
		sm: 'spacing',
		md: 'spacing',
		lg: 'spacing',
		xl: 'spacing',
	},

	// other cosmetics
	borderWidth: {
		$root: 'border-width',
		sm: 'border-width',
		md: 'border-width',
		lg: 'border-width',
	},
	borderRadius: {
		$root: 'border-radius',
		xs: 'border-radius',
		sm: 'border-radius',
		md: 'border-radius',
		lg: 'border-radius',
		xl: 'border-radius',
	},
	shadow: {
		$root: 'shadow',
		color: 'color',
		sm: shadowIntents,
		md: shadowIntents,
		lg: shadowIntents,
		xl: shadowIntents,
	},
});

export type ArborModeSchema = typeof arborModeSchema;
export type ArborModeShape = ModeValues<ArborModeSchema['definition']>;

function createShadowIntentLevel(
	primitives: Primitives,
	size: 'sm' | 'md' | 'lg' | 'xl',
) {
	return {
		x: calc`${primitives.$tokens.shadows[size].x}`,
		y: calc`${primitives.$tokens.shadows[size].y}`,
		blur: calc`${primitives.$tokens.shadows[size].blur}`,
		spread: calc`${primitives.$tokens.shadows[size].spread}`,
		color: calc`oklch(from ${{
			value: arborModeSchema.$tokens.shadow.color,
			fallback: primitives.$tokens.shadows[size].color,
		}} l c h / 15%)`,
		compiled: calc`${arborModeSchema.$tokens.shadow[size].x} ${arborModeSchema.$tokens.shadow[size].y} ${arborModeSchema.$tokens.shadow[size].blur} ${arborModeSchema.$tokens.shadow[size].spread} ${arborModeSchema.$tokens.shadow[size].color}`,
	} satisfies ModeValues<typeof shadowIntents>;
}

export function createArborModeValues<
	TCompiledColors extends CompiledColors,
>(config: {
	mainColor: keyof TCompiledColors[keyof TCompiledColors]['colors'];
	primitives: Primitives<TCompiledColors>;
}): ModeValues<ArborModeSchema['definition']> {
	// FIXME: user-facing typing for this is good, but internally something is
	// broken...
	const mainColor: any = config.primitives.$tokens.colors[config.mainColor];
	const spacingRoot = config.primitives.$tokens.spacing.$root;
	const shadowRoot = config.primitives.$tokens.shadows.$root;

	return {
		color: {
			main: mainColor,
			neutral: mainColor.$neutral,
		},
		surface: {
			padding: {
				$root: calc`${arborModeSchema.$tokens.surface.padding.block} ${arborModeSchema.$tokens.surface.padding.inline}`,
				block: calc`calc(${arborModeSchema.$tokens.spacing.lg} * max(1, ${arborModeSchema.$tokens.surface.roundness} * ${$globalProps.roundness}))`,
				inline: calc`calc(${arborModeSchema.$tokens.spacing.lg} * max(1, ${arborModeSchema.$tokens.surface.roundness} * ${$globalProps.roundness}))`,
			},
			roundness: 1,
			borderRadius: calc`calc(${arborModeSchema.$tokens.borderRadius.md} * ${arborModeSchema.$tokens.surface.roundness})`,
			primary: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.main.light}`,
					fg: calc`${arborModeSchema.$tokens.color.main.ink}`,
					border: calc`${arborModeSchema.$tokens.color.main.heavy}`,
				},
			},
			secondary: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.main.wash}`,
					fg: calc`${arborModeSchema.$tokens.color.neutral.ink}`,
					border: calc`${arborModeSchema.$tokens.color.main.ink}`,
				},
			},
			ambient: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.neutral.paper}`,
					fg: calc`${arborModeSchema.$tokens.color.neutral.ink}`,
					border: calc`${arborModeSchema.$tokens.color.neutral.heavy}`,
				},
			},
		},
		action: {
			padding: {
				$root: calc`${arborModeSchema.$tokens.action.padding.block} ${arborModeSchema.$tokens.action.padding.inline}`,
				block: calc`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
				inline: calc`calc((${config.primitives.$tokens.spacing.lg} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.sm}) / ${arborModeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: calc`calc(${arborModeSchema.$tokens.borderRadius.sm} * ${arborModeSchema.$tokens.action.roundness})`,
			primary: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.main.mid}`,
					fg: calc`${arborModeSchema.$tokens.color.main.ink}`,
					border: calc`${arborModeSchema.$tokens.color.main.heavy}`,
				},
			},
			secondary: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.neutral.paper}`,
					fg: calc`${arborModeSchema.$tokens.color.neutral.ink}`,
					border: calc`${arborModeSchema.$tokens.color.neutral.heavy}`,
				},
			},
			ambient: {
				color: {
					bg: calc`${arborModeSchema.$tokens.color.main.light}`,
					fg: calc`${arborModeSchema.$tokens.color.main.ink}`,
					border: 'transparent',
				},
			},
		},
		control: {
			padding: {
				$root: calc`${arborModeSchema.$tokens.control.padding.block} ${arborModeSchema.$tokens.control.padding.inline}`,
				block: calc`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
				inline: calc`calc((${config.primitives.$tokens.spacing.sm} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xs}) / ${arborModeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: calc`calc(${arborModeSchema.$tokens.borderRadius.sm} * ${arborModeSchema.$tokens.control.roundness})`,
			color: {
				bg: calc`${arborModeSchema.$tokens.color.neutral.paper}`,
				fg: calc`${arborModeSchema.$tokens.color.neutral.ink}`,
				border: calc`${arborModeSchema.$tokens.color.neutral.heavy}`,
			},
		},
		density: 1,
		spacing: {
			$root: calc`calc(${spacingRoot} / ${arborModeSchema.$tokens.density})`,
			xs: calc`calc(${config.primitives.$tokens.spacing.xs} / ${arborModeSchema.$tokens.density})`,
			sm: calc`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
			md: calc`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
			lg: calc`calc(${config.primitives.$tokens.spacing.lg} / ${arborModeSchema.$tokens.density})`,
			xl: calc`calc(${config.primitives.$tokens.spacing.xl} / ${arborModeSchema.$tokens.density})`,
		},
		text: {
			primary: {
				size: calc`calc(${config.primitives.$tokens.typography['3xl'].size} / ${arborModeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography['3xl'].weight,
				lineHeight: config.primitives.$tokens.typography['3xl'].lineHeight,
				font: 'sans-serif',
			},
			secondary: {
				size: calc`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.md.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.md.weight,
				lineHeight: config.primitives.$tokens.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: calc`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.sm.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.sm.weight,
				lineHeight: config.primitives.$tokens.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		borderRadius: {
			$root: calc`${arborModeSchema.$tokens.borderRadius.md}`,
			xs: calc`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.sm} * 2 / ${arborModeSchema.$tokens.density})`,
			sm: calc`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.md} * 2 / ${arborModeSchema.$tokens.density})`,
			md: calc`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.lg} * 2 / ${arborModeSchema.$tokens.density})`,
			lg: calc`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} * 2 / ${arborModeSchema.$tokens.density})`,
			xl: calc`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing['2xl']} * 2 / ${arborModeSchema.$tokens.density})`,
		},
		borderWidth: {
			$root: calc`${$globalProps.borderWidth}`,
			sm: calc`calc(max(1px, ${$globalProps.borderWidth} / 2))`,
			md: calc`${$globalProps.borderWidth}`,
			lg: calc`calc(${$globalProps.borderWidth} * 2)`,
		},
		shadow: {
			$root: calc`${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}`,
			color: calc`${arborModeSchema.$tokens.color.neutral.heavy}`,
			sm: createShadowIntentLevel(config.primitives, 'sm'),
			md: createShadowIntentLevel(config.primitives, 'md'),
			lg: createShadowIntentLevel(config.primitives, 'lg'),
			xl: createShadowIntentLevel(config.primitives, 'xl'),
		},
	} satisfies ModeValues<(typeof arborModeSchema)['definition']>;
}
