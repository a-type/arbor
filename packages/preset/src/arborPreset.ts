import { css } from '@arbor-css/calc';
import { CompiledColors } from '@arbor-css/colors';
import { createGlobalContext, GlobalConfigProps } from '@arbor-css/globals';
import {
	createModeSchema,
	ModeSchema,
	ModeSchemaLevel,
	ModeValues,
	PartialModeInstance,
} from '@arbor-css/modes';
import { Primitives } from '@arbor-css/primitives';
import { CreateToken } from '@arbor-css/tokens';

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

export const arborModeDefinition = {
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
} satisfies ModeSchemaLevel;

export function createArborModeSchema({
	createToken,
}: {
	createToken: CreateToken;
}) {
	return createModeSchema(arborModeDefinition, {
		createToken,
	});
}

export const arborModeSchema = createArborModeSchema({
	createToken: createGlobalContext().createToken,
});

export type ArborModeSchema = typeof arborModeSchema;
export type ArborModeSchemaDefinition = typeof arborModeDefinition;
export type ArborModeValues = ModeValues<ArborModeSchemaDefinition>;
export type ModesOfArborModeSchema = Record<
	string,
	PartialModeInstance<ArborModeSchemaDefinition>
>;

function createShadowIntentLevel(
	primitives: Primitives<any>,
	size: 'sm' | 'md' | 'lg' | 'xl',
	modeSchema: ModeSchema<ArborModeSchemaDefinition>,
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
			modeSchema.$tokens.shadow.color,
			primitives.$tokens.shadows[size].color,
		]} l c h / 15%)`,
		compiled: css`
			${modeSchema.$tokens.shadow[size].x} ${modeSchema.$tokens.shadow[size]
				.y} ${modeSchema.$tokens.shadow[size].blur} ${modeSchema.$tokens.shadow[
				size
			].spread} ${modeSchema.$tokens.shadow[size].color}
		`,
	} satisfies ModeValues<typeof shadowIntents>;
}

export function createArborModeValues<
	TCompiledColors extends CompiledColors,
>(config: {
	mainColor: keyof TCompiledColors[keyof TCompiledColors]['colors'];
	primitives: Primitives<TCompiledColors>;
	modeSchema?: ModeSchema<ArborModeSchemaDefinition>;
	globalProps: GlobalConfigProps;
}): ModeValues<ArborModeSchema['definition']> {
	// FIXME: user-facing typing for this is good, but internally something is
	// broken...
	const modeSchema = config.modeSchema ?? arborModeSchema;
	const globalProps = config.globalProps;
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
					${modeSchema.$tokens.surface.padding.block} ${modeSchema.$tokens
						.surface.padding.inline}
				`,
				block: css`calc(${modeSchema.$tokens.spacing.lg} * max(1, ${modeSchema.$tokens.surface.roundness} * ${globalProps.roundness}))`,
				inline: css`calc(${modeSchema.$tokens.spacing.lg} * max(1, ${modeSchema.$tokens.surface.roundness} * ${globalProps.roundness}))`,
			},
			roundness: 1,
			borderRadius: css`calc(${modeSchema.$tokens.borderRadius.md} * ${modeSchema.$tokens.surface.roundness})`,
			primary: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.main.light}
					`,
					fg: css`
						${modeSchema.$tokens.color.main.ink}
					`,
					border: css`
						${modeSchema.$tokens.color.main.heavy}
					`,
				},
			},
			secondary: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.main.wash}
					`,
					fg: css`
						${modeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${modeSchema.$tokens.color.main.ink}
					`,
				},
			},
			ambient: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.neutral.paper}
					`,
					fg: css`
						${modeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${modeSchema.$tokens.color.neutral.heavy}
					`,
				},
			},
		},
		action: {
			padding: {
				$root: css`
					${modeSchema.$tokens.action.padding.block} ${modeSchema.$tokens.action
						.padding.inline}
				`,
				block: css`calc(${config.primitives.$tokens.spacing.md} / ${modeSchema.$tokens.density})`,
				inline: css`calc((${config.primitives.$tokens.spacing.lg} + ${globalProps.roundness} * ${config.primitives.$tokens.spacing.sm}) / ${modeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: css`calc(${modeSchema.$tokens.borderRadius.sm} * ${modeSchema.$tokens.action.roundness})`,
			primary: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.main.mid}
					`,
					fg: css`
						${modeSchema.$tokens.color.main.ink}
					`,
					border: css`
						${modeSchema.$tokens.color.main.heavy}
					`,
				},
			},
			secondary: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.neutral.paper}
					`,
					fg: css`
						${modeSchema.$tokens.color.neutral.ink}
					`,
					border: css`
						${modeSchema.$tokens.color.neutral.heavy}
					`,
				},
			},
			ambient: {
				color: {
					bg: css`
						${modeSchema.$tokens.color.main.light}
					`,
					fg: css`
						${modeSchema.$tokens.color.main.ink}
					`,
					border: 'transparent',
				},
			},
		},
		control: {
			padding: {
				$root: css`
					${modeSchema.$tokens.control.padding.block} ${modeSchema.$tokens
						.control.padding.inline}
				`,
				block: css`calc(${config.primitives.$tokens.spacing.sm} / ${modeSchema.$tokens.density})`,
				inline: css`calc((${config.primitives.$tokens.spacing.sm} + ${globalProps.roundness} * ${config.primitives.$tokens.spacing.xs}) / ${modeSchema.$tokens.density})`,
			},
			roundness: 1,
			borderRadius: css`calc(${modeSchema.$tokens.borderRadius.sm} * ${modeSchema.$tokens.control.roundness})`,
			color: {
				bg: css`
					${modeSchema.$tokens.color.neutral.paper}
				`,
				fg: css`
					${modeSchema.$tokens.color.neutral.ink}
				`,
				border: css`
					${modeSchema.$tokens.color.neutral.heavy}
				`,
			},
		},
		density: 1,
		spacing: {
			$root: css`calc(${spacingRoot} / ${modeSchema.$tokens.density})`,
			xs: css`calc(${config.primitives.$tokens.spacing.xs} / ${modeSchema.$tokens.density})`,
			sm: css`calc(${config.primitives.$tokens.spacing.sm} / ${modeSchema.$tokens.density})`,
			md: css`calc(${config.primitives.$tokens.spacing.md} / ${modeSchema.$tokens.density})`,
			lg: css`calc(${config.primitives.$tokens.spacing.lg} / ${modeSchema.$tokens.density})`,
			xl: css`calc(${config.primitives.$tokens.spacing.xl} / ${modeSchema.$tokens.density})`,
		},
		text: {
			primary: {
				size: css`calc(${config.primitives.$tokens.typography['3xl'].size} / ${modeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography['3xl'].weight,
				lineHeight: config.primitives.$tokens.typography['3xl'].lineHeight,
				font: 'sans-serif',
			},
			secondary: {
				size: css`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.md.size} / ${modeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.md.weight,
				lineHeight: config.primitives.$tokens.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: css`calc(max(${config.primitives.$tokens.typography.xs.size}, ${config.primitives.$tokens.typography.sm.size} / ${modeSchema.$tokens.density}))`,
				weight: config.primitives.$tokens.typography.sm.weight,
				lineHeight: config.primitives.$tokens.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		borderRadius: {
			$root: css`
				${modeSchema.$tokens.borderRadius.md}
			`,
			xs: css`calc(${globalProps.roundness} * ${config.primitives.$tokens.spacing.sm} * 2 / ${modeSchema.$tokens.density})`,
			sm: css`calc(${globalProps.roundness} * ${config.primitives.$tokens.spacing.md} * 2 / ${modeSchema.$tokens.density})`,
			md: css`calc(${globalProps.roundness} * ${config.primitives.$tokens.spacing.lg} * 2 / ${modeSchema.$tokens.density})`,
			lg: css`calc(${globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} * 2 / ${modeSchema.$tokens.density})`,
			xl: css`calc(${globalProps.roundness} * ${config.primitives.$tokens.spacing['2xl']} * 2 / ${modeSchema.$tokens.density})`,
		},
		borderWidth: {
			$root: css`
				${globalProps.borderWidth}
			`,
			sm: css`calc(max(1px, ${globalProps.borderWidth} / 2))`,
			md: css`
				${globalProps.borderWidth}
			`,
			lg: css`calc(${globalProps.borderWidth} * 2)`,
		},
		shadow: {
			$root: css`
				${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}
			`,
			color: css`
				${modeSchema.$tokens.color.neutral.heavy}
			`,
			sm: createShadowIntentLevel(config.primitives, 'sm', modeSchema),
			md: createShadowIntentLevel(config.primitives, 'md', modeSchema),
			lg: createShadowIntentLevel(config.primitives, 'lg', modeSchema),
			xl: createShadowIntentLevel(config.primitives, 'xl', modeSchema),
		},
	} satisfies ModeValues<ArborModeSchemaDefinition>;
}
