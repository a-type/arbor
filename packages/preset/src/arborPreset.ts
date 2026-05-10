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
			lighter: 'color',
			light: 'color',
			mid: 'color',
			heavy: 'color',
			heavier: 'color',
			ink: 'color',
		},
		neutral: {
			$root: 'color',
			paper: 'color',
			wash: 'color',
			lighter: 'color',
			light: 'color',
			mid: 'color',
			heavy: 'color',
			heavier: 'color',
			ink: 'color',
		},
	},

	// intents
	action: {
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
	},
	control: colorIntents,
	surface: {
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
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
		sm: 'border-radius',
		md: 'border-radius',
		lg: 'border-radius',
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
		color: derive`${{
			value: arborModeSchema.$tokens.shadow.color,
			fallback: primitives.$tokens.shadows[size].color,
		}}`,
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
	const spacingRoot = (config.primitives.$tokens.spacing as any).$root;
	const shadowRoot = (config.primitives.$tokens.shadows as any).$root;

	return {
		colors: {
			main: mainColor,
			neutral: mainColor.$neutral,
		},
		surface: {
			primary: {
				bg: derive`${arborModeSchema.$tokens.colors.main.lighter}`,
				fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
				border: derive`${arborModeSchema.$tokens.colors.main.heavy}`,
			},
			secondary: {
				bg: derive`${arborModeSchema.$tokens.colors.main.wash}`,
				fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
				border: derive`${arborModeSchema.$tokens.colors.main.ink}`,
			},
			ambient: {
				bg: derive`${arborModeSchema.$tokens.colors.neutral.paper}`,
				fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
				border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
			},
		},
		action: {
			primary: {
				bg: derive`${arborModeSchema.$tokens.colors.main.mid}`,
				fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
				border: derive`${arborModeSchema.$tokens.colors.main.heavy}`,
			},
			secondary: {
				bg: derive`${arborModeSchema.$tokens.colors.neutral.wash}`,
				fg: derive`${arborModeSchema.$tokens.colors.neutral.heavier}`,
				border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
			},
			ambient: {
				bg: derive`${arborModeSchema.$tokens.colors.main.lighter}`,
				fg: derive`${arborModeSchema.$tokens.colors.main.ink}`,
				border: 'transparent',
			},
		},
		control: {
			bg: derive`${arborModeSchema.$tokens.colors.neutral.paper}`,
			fg: derive`${arborModeSchema.$tokens.colors.neutral.ink}`,
			border: derive`${arborModeSchema.$tokens.colors.neutral.heavy}`,
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
				size: derive`calc(${config.primitives.$tokens.typography.md.size} / ${arborModeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography.md.weight,
				lineHeight: config.primitives.$tokens.typography.md.lineHeight,
				font: 'sans-serif',
			},
			ambient: {
				size: derive`calc(${config.primitives.$tokens.typography.sm.size} / ${arborModeSchema.$tokens.density})`,
				weight: config.primitives.$tokens.typography.sm.weight,
				lineHeight: config.primitives.$tokens.typography.sm.lineHeight,
				font: 'sans-serif',
			},
		},
		borderRadius: {
			$root: derive`calc(${$globalProps.roundness} * ${spacingRoot} / ${arborModeSchema.$tokens.density})`,
			sm: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
			md: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.lg} / ${arborModeSchema.$tokens.density})`,
			lg: derive`calc(${$globalProps.roundness} * ${config.primitives.$tokens.spacing.xl} / ${arborModeSchema.$tokens.density})`,
		},
		borderWidth: {
			$root: '1',
			sm: '1',
			md: '1',
			lg: '2',
		},
		shadow: {
			$root: derive`${shadowRoot.x} ${shadowRoot.y} ${shadowRoot.blur} ${shadowRoot.spread} ${shadowRoot.color}`,
			color: derive`${arborModeSchema.$tokens.colors.neutral.heavier}`,
			sm: createShadowIntentLevel(config.primitives, 'sm'),
			md: createShadowIntentLevel(config.primitives, 'md'),
			lg: createShadowIntentLevel(config.primitives, 'lg'),
			xl: createShadowIntentLevel(config.primitives, 'xl'),
		},
	} satisfies ModeValues<(typeof arborModeSchema)['definition']>;
}
