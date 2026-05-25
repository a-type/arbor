import { css } from '@arbor-css/calc';
import { CompiledColors } from '@arbor-css/colors';
import { createGlobalContext, GlobalConfigProps } from '@arbor-css/globals';
import {
	createModeSchema,
	ModeSchema,
	ModeValues,
	PartialModeInstance,
} from '@arbor-css/modes';
import { Primitives } from '@arbor-css/primitives';
import { CreateToken, SimpleTokenSchema } from '@arbor-css/tokens';

const colorIntents = {
	fg: {
		purpose: 'color',
		description: 'Intended for use as the foreground color',
	},
	bg: {
		purpose: 'color',
		description: 'Intended for use as the background color',
	},
	border: {
		purpose: 'color',
		description: 'Intended for use as the border color, if desired',
	},
} satisfies SimpleTokenSchema;

const boxIntents = {
	$root: {
		purpose: 'other',
		description:
			'Combines inline and block padding, can be passed directly to "padding"',
	},
	inline: {
		purpose: 'spacing',
		description: 'Inline (horizontal, usually) padding',
	},
	block: {
		purpose: 'spacing',
		description: 'Block (vertical, usually) padding',
	},
} satisfies SimpleTokenSchema;

const textIntents = {
	size: 'font-size',
	weight: 'font-weight',
	lineHeight: 'line-height',
	font: 'font-family',
} satisfies SimpleTokenSchema;

const shadowIntents = {
	x: {
		purpose: 'size',
		description: 'Horizontal offset of the shadow',
	},
	y: {
		purpose: 'size',
		description: 'Vertical offset of the shadow',
	},
	blur: {
		purpose: 'size',
		description: 'Blur radius of the shadow',
	},
	spread: {
		purpose: 'size',
		description: 'Spread radius of the shadow',
	},
	color: {
		purpose: 'color',
		description: 'Color of the shadow',
	},
	$root: {
		purpose: 'shadow',
		description: 'Full shadow value, can be passed to "box-shadow"',
	},
} satisfies SimpleTokenSchema;

export const arborModeDefinition = {
	color: {
		main: {
			$root: {
				purpose: 'color',
				description: 'A convenient reference for the "mid" shade',
			},
			paper: {
				purpose: 'color',
				description: 'A very light shade, good for backgrounds and surfaces',
			},
			wash: {
				purpose: 'color',
				description:
					'A very faint but colorful shade, good for backgrounds and surfaces',
			},
			light: {
				purpose: 'color',
				description:
					"A light shade of the mode's main color, good for emphasized surfaces.",
			},
			mid: {
				purpose: 'color',
				description:
					"The main shade of the mode's main color, good for primary actions and decoration.",
			},
			heavy: {
				purpose: 'color',
				description:
					"A heavy shade of the mode's main color, good for text emphasis and accents.",
			},
			ink: {
				purpose: 'color',
				description:
					"A very dark but still colorful shade of the mode's main color, good for text and high contrast elements.",
			},
		},
		neutral: {
			$root: {
				purpose: 'color',
				description: 'A convenient reference for the "mid" neutral shade',
			},
			paper: {
				purpose: 'color',
				description:
					'A very light neutral shade, good for backgrounds and surfaces',
			},
			wash: {
				purpose: 'color',
				description: 'A faint neutral shade, good for backgrounds and surfaces',
			},
			light: {
				purpose: 'color',
				description: 'A light neutral shade, good for emphasized surfaces',
			},
			mid: {
				purpose: 'color',
				description:
					'The main neutral shade, good for primary actions and decoration',
			},
			heavy: {
				purpose: 'color',
				description:
					'A heavy neutral shade, good for low-emphasis text and accents',
			},
			ink: {
				purpose: 'color',
				description:
					'A very dark neutral shade, good for text and high contrast elements',
			},
		},
	},

	// intents
	action: {
		padding: boxIntents,
		roundness: {
			purpose: 'other',
			description:
				'This token controls the overall roundness of actions and stacks with the root roundness token',
		},
		borderRadius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of actions, taking into account the overall roundness',
		},
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
		roundness: {
			purpose: 'other',
			description:
				'This token controls the overall roundness of controls and stacks with the root roundness token',
		},
		borderRadius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of controls, taking into account the overall roundness',
		},
		color: colorIntents,
	},
	surface: {
		padding: boxIntents,
		roundness: {
			purpose: 'other',
			description:
				'This token controls the overall roundness of surfaces and stacks with the root roundness token',
		},
		borderRadius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of surfaces, taking into account the overall roundness',
		},
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
	density: {
		purpose: 'other',
		description:
			'A scaling factor for density. Higher density means smaller, tighter spacing and size',
	},
	spacing: {
		$root: {
			purpose: 'spacing',
			description: 'A convenient reference for the "md" spacing size',
		},
		xs: 'spacing',
		sm: 'spacing',
		md: 'spacing',
		lg: 'spacing',
		xl: 'spacing',
	},

	// other cosmetics
	borderWidth: {
		$root: {
			purpose: 'border-width',
			description: 'A convenient reference for the "md" border width',
		},
		sm: {
			purpose: 'border-width',
			description:
				'A hairline border width. Always >= 1px. If the global border width is small, this may be the same as "md"',
		},
		md: {
			purpose: 'border-width',
			description: 'A general-purpose border width',
		},
		lg: {
			purpose: 'border-width',
			description: 'A thicker border, good for emphasis',
		},
	},
	borderRadius: {
		$root: {
			purpose: 'border-radius',
			description: 'A convenient reference for the "md" border radius',
		},
		xs: 'border-radius',
		sm: 'border-radius',
		md: 'border-radius',
		lg: 'border-radius',
		xl: 'border-radius',
	},
	shadow: {
		$root: {
			purpose: 'shadow',
			description: 'A convenient reference for the "md" shadow level',
		},
		color: {
			purpose: 'color',
			description:
				'If specified, this token overrides shadow colors from primitives',
		},
		sm: shadowIntents,
		md: shadowIntents,
		lg: shadowIntents,
		xl: shadowIntents,
	},
} satisfies SimpleTokenSchema;

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
		$root: css`
			${modeSchema.$tokens.shadow[size].x} ${modeSchema.$tokens.shadow[size]
				.y} ${modeSchema.$tokens.shadow[size].blur} ${modeSchema.$tokens.shadow[
				size
			].spread} ${modeSchema.$tokens.shadow[size].color}
		`,
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
					bg: 'transparent',
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
