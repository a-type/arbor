import { css } from '@arbor-css/calc';
import { CompiledColors } from '@arbor-css/colors';
import { $globalProps } from '@arbor-css/globals';
import {
	createModeSchema,
	ModeSchemaLevel,
	ModeValues,
	PartialModeInstance,
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
export type ArborModeSchemaDefinition = ArborModeSchema['definition'];
export type ArborModeValues = ModeValues<ArborModeSchemaDefinition>;
export type ModesOfArborModeSchema = Record<
	string,
	PartialModeInstance<ArborModeSchemaDefinition>
>;

function createShadowIntentLevel(
	primitives: Primitives<any>,
	size: 'sm' | 'md' | 'lg' | 'xl',
) {
	return {
		x: css`
			${primitives.$tokens.shadows[size].x}
		`,
		y: css`
			${primitives.$tokens.shadows[size].y}
		`,
		blur: css`
			${primitives.$tokens.shadows[size].blur}
		`,
		spread: css`
			${primitives.$tokens.shadows[size].spread}
		`,
		color: css`oklch(from ${[
			arborModeSchema.$tokens.shadow.color,
			primitives.$tokens.shadows[size].color,
		]} l c h / 15%)`,
		compiled: css`
			${arborModeSchema.$tokens.shadow[size].x} ${arborModeSchema.$tokens
				.shadow[size].y} ${arborModeSchema.$tokens.shadow[size]
				.blur} ${arborModeSchema.$tokens.shadow[size].spread} ${arborModeSchema
				.$tokens.shadow[size].color}
		`,
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
				$root: css`
					${arborModeSchema.$tokens.surface.padding.block} ${arborModeSchema
						.$tokens.surface.padding.inline}
				`,
				block: css`calc(${arborModeSchema.$tokens.spacing.lg} * max(1, ${arborModeSchema.$tokens.surface.roundness} * ${$globalProps.roundness}))`,
				inline: css`calc(${arborModeSchema.$tokens.spacing.lg} * max(1, ${arborModeSchema.$tokens.surface.roundness} * ${$globalProps.roundness}))`,
			},
			roundness: 1,
			borderRadius: css`calc(${arborModeSchema.$tokens.borderRadius.md} * ${arborModeSchema.$tokens.surface.roundness})`,
			primary: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.main.light}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.main.ink}
					`,
					border: css`
						${arborModeSchema.$tokens.color.main.heavy}
					`,
				},
			},
			secondary: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.main.wash}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${arborModeSchema.$tokens.color.main.ink}
					`,
				},
			},
			ambient: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.neutral.paper}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${arborModeSchema.$tokens.color.neutral.heavy}
					`,
				},
			},
		},
		action: {
			padding: {
				$root: css`
					${arborModeSchema.$tokens.action.padding.block} ${arborModeSchema
						.$tokens.action.padding.inline}
				`,
				block: css`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
				inline: css`calc((${config.primitives.$tokens.spacing.lg} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.sm}) / ${arborModeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: css`calc(${arborModeSchema.$tokens.borderRadius.sm} * ${arborModeSchema.$tokens.action.roundness})`,
			primary: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.main.mid}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.main.ink}
					`,
					border: css`
						${arborModeSchema.$tokens.color.main.heavy}
					`,
				},
			},
			secondary: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.neutral.paper}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${arborModeSchema.$tokens.color.neutral.heavy}
					`,
				},
			},
			ambient: {
				color: {
					bg: css`
						${arborModeSchema.$tokens.color.main.light}
					`,
					fg: css`
						${arborModeSchema.$tokens.color.main.ink}
					`,
					border: 'transparent',
				},
			},
		},
		control: {
			padding: {
				$root: css`
					${arborModeSchema.$tokens.control.padding.block} ${arborModeSchema
						.$tokens.control.padding.inline}
				`,
				block: css`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
				inline: css`calc((${config.primitives.$tokens.spacing.sm} + ${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xs}) / ${arborModeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: css`calc(${arborModeSchema.$tokens.borderRadius.sm} * ${arborModeSchema.$tokens.control.roundness})`,
			color: {
				bg: css`
					${arborModeSchema.$tokens.color.neutral.paper}
				`,
				fg: css`
					${arborModeSchema.$tokens.color.neutral.ink}
				`,
				border: css`
					${arborModeSchema.$tokens.color.neutral.heavy}
				`,
			},
		},
		density: 1,
		spacing: {
			$root: css`calc(${spacingRoot} / ${arborModeSchema.$tokens.density})`,
			xs: css`calc(${config.primitives.$tokens.spacing.xs} / ${arborModeSchema.$tokens.density})`,
			sm: css`calc(${config.primitives.$tokens.spacing.sm} / ${arborModeSchema.$tokens.density})`,
			md: css`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
			lg: css`calc(${config.primitives.$tokens.spacing.lg} / ${arborModeSchema.$tokens.density})`,
			xl: css`calc(${config.primitives.$tokens.spacing.xl} / ${arborModeSchema.$tokens.density})`,
		},
		text: {
			primary: {
				size: css`calc(${config.primitives.$tokens.typography['3xl'].size} / ${arborModeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography['3xl'].weight,
				lineHeight: config.primitives.$tokens.typography['3xl'].lineHeight,
				font: 'sans-serif',
			},
			secondary: {
				size: css`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.md.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.md.weight,
				lineHeight: config.primitives.$tokens.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: css`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.sm.size} / ${arborModeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.sm.weight,
				lineHeight: config.primitives.$tokens.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		borderRadius: {
			$root: css`
				${arborModeSchema.$tokens.borderRadius.md}
			`,
			xs: css`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.sm} * 2 / ${arborModeSchema.$tokens.density})`,
			sm: css`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.md} * 2 / ${arborModeSchema.$tokens.density})`,
			md: css`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.lg} * 2 / ${arborModeSchema.$tokens.density})`,
			lg: css`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} * 2 / ${arborModeSchema.$tokens.density})`,
			xl: css`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing['2xl']} * 2 / ${arborModeSchema.$tokens.density})`,
		},
		borderWidth: {
			$root: css`
				${$globalProps.borderWidth}
			`,
			sm: css`calc(max(1px, ${$globalProps.borderWidth} / 2))`,
			md: css`
				${$globalProps.borderWidth}
			`,
			lg: css`calc(${$globalProps.borderWidth} * 2)`,
		},
		shadow: {
			$root: css`
				${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}
			`,
			color: css`
				${arborModeSchema.$tokens.color.neutral.heavy}
			`,
			sm: createShadowIntentLevel(config.primitives, 'sm'),
			md: createShadowIntentLevel(config.primitives, 'md'),
			lg: createShadowIntentLevel(config.primitives, 'lg'),
			xl: createShadowIntentLevel(config.primitives, 'xl'),
		},
	} satisfies ModeValues<(typeof arborModeSchema)['definition']>;
}
