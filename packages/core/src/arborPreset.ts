import { CompiledColors } from '@arbor-css/colors';
import {
	createModeSchema,
	derive,
	ModeSchemaLevel,
	ModeValues,
} from '@arbor-css/modes';
import { Primitives } from './primitives/primitives.js';

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

export const arborModeSchema = createModeSchema({
	// colors
	mainColor: {
		paper: 'color',
		wash: 'color',
		lighter: 'color',
		light: 'color',
		mid: 'color',
		heavy: 'color',
		heavier: 'color',
		ink: 'color',
	},
	neutralColor: {
		paper: 'color',
		wash: 'color',
		lighter: 'color',
		light: 'color',
		mid: 'color',
		heavy: 'color',
		heavier: 'color',
		ink: 'color',
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
		xs: 'spacing',
		sm: 'spacing',
		md: 'spacing',
		lg: 'spacing',
		xl: 'spacing',
	},

	// other cosmetics
	borderWidth: {
		sm: 'border-width',
		md: 'border-width',
		lg: 'border-width',
	},
	borderRadius: {
		sm: 'border-radius',
		md: 'border-radius',
		lg: 'border-radius',
	},
});

export function createArborModeValues<
	TCompiledColors extends CompiledColors,
>(config: {
	mainColor: keyof TCompiledColors[keyof TCompiledColors]['colors'];
	primitives: Primitives<TCompiledColors>;
}) {
	// FIXME: user-facing typing for this is good, but internally something is
	// broken...
	const mainColor: any = config.primitives.$tokens.colors[config.mainColor];

	return {
		mainColor,
		neutralColor: mainColor.$neutral,
		surface: {
			primary: {
				bg: derive`${arborModeSchema.$tokens.mainColor.wash}`,
				fg: derive`${arborModeSchema.$tokens.mainColor.ink}`,
				border: derive`${arborModeSchema.$tokens.mainColor.heavy}`,
			},
			secondary: {
				bg: derive`${arborModeSchema.$tokens.mainColor.paper}`,
				fg: derive`${arborModeSchema.$tokens.neutralColor.ink}`,
				border: derive`${arborModeSchema.$tokens.mainColor.ink}`,
			},
			ambient: {
				bg: derive`${arborModeSchema.$tokens.neutralColor.paper}`,
				fg: derive`${arborModeSchema.$tokens.neutralColor.ink}`,
				border: derive`${arborModeSchema.$tokens.neutralColor.heavy}`,
			},
		},
		action: {
			primary: {
				bg: derive`${arborModeSchema.$tokens.mainColor.mid}`,
				fg: derive`${arborModeSchema.$tokens.mainColor.ink}`,
				border: derive`${arborModeSchema.$tokens.mainColor.heavy}`,
			},
			secondary: {
				bg: derive`${arborModeSchema.$tokens.neutralColor.wash}`,
				fg: derive`${arborModeSchema.$tokens.neutralColor.heavier}`,
				border: derive`${arborModeSchema.$tokens.neutralColor.heavy}`,
			},
			ambient: {
				bg: derive`${arborModeSchema.$tokens.mainColor.lighter}`,
				fg: derive`${arborModeSchema.$tokens.mainColor.ink}`,
				border: 'transparent',
			},
		},
		control: {
			bg: derive`${arborModeSchema.$tokens.neutralColor.paper}`,
			fg: derive`${arborModeSchema.$tokens.neutralColor.ink}`,
			border: derive`${arborModeSchema.$tokens.neutralColor.heavy}`,
		},
		density: 1,
		spacing: {
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
			sm: derive`calc(${config.primitives.$tokens.spacing.md} / ${arborModeSchema.$tokens.density})`,
			md: derive`calc(${config.primitives.$tokens.spacing.lg} / ${arborModeSchema.$tokens.density})`,
			lg: derive`calc(${config.primitives.$tokens.spacing.xl} / ${arborModeSchema.$tokens.density})`,
		},
		borderWidth: {
			sm: '1',
			md: '1',
			lg: '2',
		},
	} satisfies ModeValues<(typeof arborModeSchema)['definition']>;
}
