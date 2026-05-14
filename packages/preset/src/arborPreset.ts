import { CompiledColors } from '@arbor-css/colors';
import { $globalProps } from '@arbor-css/globals';
import {
	createModeSchema,
	derive,
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
	colors: {
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
		color: colorIntents,
		padding: boxIntents,
	},
	surface: {
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
		x: derive`${primitives.$tokens.shadows[size].x}`,
		y: derive`${primitives.$tokens.shadows[size].y}`,
		blur: derive`${primitives.$tokens.shadows[size].blur}`,
		spread: derive`${primitives.$tokens.shadows[size].spread}`,
		color: derive`oklch(from ${{
			value: arborModeSchema.$tokens.shadow.color,
			fallback: primitives.$tokens.shadows[size].color,
		}} l c h / 15%)`,
		compiled: derive`${arborModeSchema.$tokens.shadow[size].x} ${arborModeSchema.$tokens.shadow[size].y} ${arborModeSchema.$tokens.shadow[size].blur} ${arborModeSchema.$tokens.shadow[size].spread} ${arborModeSchema.$tokens.shadow[size].color}`,
	} satisfies ModeValues<typeof shadowIntents>;
}

export function createArborModeValues<
	TCompiledColors extends CompiledColors,
>(config: {
	mainColor: keyof TCompiledColors[keyof TCompiledColors]['colors'];
	primitives: Primitives<TCompiledColors>;
}) {
	// FIXME: user-facing typing for this is good, but internally something is
	// broken...
	const mainColor: any = config.primitives.$tokens.colors[config.mainColor];
	const spacingRoot = config.primitives.$tokens.spacing.$root;
	const shadowRoot = config.primitives.$tokens.shadows.$root;

	return {
		colors: {
			main: mainColor,
			neutral: mainColor.$neutral,
		},
		surface: {
			primary: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.main.wash}`,
					fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
					border: derive`${arborModeSchema.$tokens.colors.main.heavy}`,
				},
			},
			secondary: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.main.paper}`,
					fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
					border: derive`${arborModeSchema.$tokens.colors.main.ink}`,
				},
			},
			ambient: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.neutral.paper}`,
					fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
					border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
				},
			},
		},
		action: {
			padding: {
				block: derive`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
				inline: derive`calc((${config.primitives.$tokens.spacing.md} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.sm}) / ${arborModeSchema.$tokens.density})`,
			},
			primary: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.main.mid}`,
					fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
					border: derive`${arborModeSchema.$tokens.colors.main.heavy}`,
				},
			},
			secondary: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.neutral.paper}`,
					fg: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
					border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
				},
			},
			ambient: {
				color: {
					bg: derive`${arborModeSchema.$tokens.colors.main.light}`,
					fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
					border: 'transparent',
				},
			},
		},
		control: {
			color: {
				bg: derive`${arborModeSchema.$tokens.colors.neutral.paper}`,
				fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
				border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
			},

			padding: {
				block: derive`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
				inline: derive`calc((${config.primitives.$tokens.spacing.sm} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xs}) / ${arborModeSchema.$tokens.density})`,
			},
		},
		density: 1,
		spacing: {
			$root: derive`calc(${spacingRoot} / ${arborModeSchema.$tokens.density})`,
			xs: derive`calc(${config.primitives.$tokens.spacing.xs} / ${arborModeSchema.$tokens.density})`,
			sm: derive`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
			md: derive`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
			lg: derive`calc(${config.primitives.$tokens.spacing.lg} / ${arborModeSchema.$tokens.density})`,
			xl: derive`calc(${config.primitives.$tokens.spacing.xl} / ${arborModeSchema.$tokens.density})`,
		},
		text: {
			primary: {
				size: derive`calc(${config.primitives.$tokens.typography['3xl'].size} / ${arborModeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography['3xl'].weight,
				lineHeight: config.primitives.$tokens.typography['3xl'].lineHeight,
				font: 'sans-serif',
			},
			secondary: {
				size: derive`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.md.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.md.weight,
				lineHeight: config.primitives.$tokens.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: derive`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.sm.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.sm.weight,
				lineHeight: config.primitives.$tokens.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		borderRadius: {
			$root: derive`calc(${$globalProps.roundness} * ${spacingRoot} * 2 / ${arborModeSchema.$tokens.density})`,
			xs: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xs} * 2 / ${arborModeSchema.$tokens.density})`,
			sm: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.md} * 2 / ${arborModeSchema.$tokens.density})`,
			md: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.lg} * 2 / ${arborModeSchema.$tokens.density})`,
			lg: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} * 2 / ${arborModeSchema.$tokens.density})`,
			xl: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} * 4 / ${arborModeSchema.$tokens.density})`,
		},
		borderWidth: {
			$root: derive`${$globalProps.borderWidth}`,
			sm: derive`calc(max(1px, ${$globalProps.borderWidth} / 2))`,
			md: derive`${$globalProps.borderWidth}`,
			lg: derive`calc(${$globalProps.borderWidth} * 2)`,
		},
		shadow: {
			$root: derive`${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}`,
			color: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
			sm: createShadowIntentLevel(config.primitives, 'sm'),
			md: createShadowIntentLevel(config.primitives, 'md'),
			lg: createShadowIntentLevel(config.primitives, 'lg'),
			xl: createShadowIntentLevel(config.primitives, 'xl'),
		},
	} satisfies ModeValues<(typeof arborModeSchema)['definition']>;
}
