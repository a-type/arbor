import { $systemProps } from '@arbor-css/globals';

export interface ColorPropEntry {
	/** CSS custom property name for the applied color */
	applied: string;
	/** CSS custom property name for the final color (used as the actual property value) */
	final: string;
	/** CSS custom property name for opacity */
	opacity: string;
	/** Extra custom properties to inject alongside the standard three */
	extras?: Array<{
		prop: string;
		/** 'applied' = use the resolved color value; otherwise treat as a literal CSS value */
		value: string;
	}>;
}

/**
 * Maps CSS color-related property names to the Arbor system props they should populate.
 * Mirrors the behavior of the `classes` package color rules.
 */
export const COLOR_PROP_ENTRIES: Record<string, ColorPropEntry> = {
	color: {
		applied: $systemProps.fg.applied.name,
		final: $systemProps.fg.final.name,
		opacity: $systemProps.fg.opacity.name,
	},
	'background-color': {
		applied: $systemProps.bg.applied.name,
		final: $systemProps.bg.final.name,
		opacity: $systemProps.bg.opacity.name,
		extras: [{ prop: $systemProps.bg.contrast.name, value: 'applied' }],
	},
	background: {
		applied: $systemProps.bg.applied.name,
		final: $systemProps.bg.final.name,
		opacity: $systemProps.bg.opacity.name,
		extras: [{ prop: $systemProps.bg.contrast.name, value: 'applied' }],
	},
	'border-color': {
		applied: $systemProps.borderColor[''].applied.name,
		final: $systemProps.borderColor[''].final.name,
		opacity: $systemProps.borderColor[''].opacity.name,
	},
	fill: {
		applied: $systemProps.fill.applied.name,
		final: $systemProps.fill.final.name,
		opacity: $systemProps.fill.opacity.name,
	},
	stroke: {
		applied: $systemProps.stroke.applied.name,
		final: $systemProps.stroke.final.name,
		opacity: $systemProps.stroke.opacity.name,
	},
	'accent-color': {
		applied: $systemProps.accent.applied.name,
		final: $systemProps.accent.final.name,
		opacity: $systemProps.accent.opacity.name,
	},
};
