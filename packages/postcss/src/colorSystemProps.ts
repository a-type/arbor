import { ArborPreset } from '@arbor-css/core';

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
export function getColorPropEntries(
	preset: ArborPreset,
): Record<string, ColorPropEntry> {
	if (!preset.$?.system) return {};
	const systemProps = preset.$.system;
	return {
		color: {
			applied: systemProps.ref.fg.applied.name,
			final: systemProps.ref.fg.$root.name,
			opacity: systemProps.ref.fg.opacity.name,
		},
		'background-color': {
			applied: systemProps.ref.bg.applied.name,
			final: systemProps.ref.bg.$root.name,
			opacity: systemProps.ref.bg.opacity.name,
			extras: [{ prop: systemProps.ref.bg.contrast.name, value: 'applied' }],
		},
		background: {
			applied: systemProps.ref.bg.applied.name,
			final: systemProps.ref.bg.$root.name,
			opacity: systemProps.ref.bg.opacity.name,
			extras: [{ prop: systemProps.ref.bg.contrast.name, value: 'applied' }],
		},
		'border-color': {
			applied: systemProps.ref.borderColor[''].applied.name,
			final: systemProps.ref.borderColor[''].$root.name,
			opacity: systemProps.ref.borderColor[''].opacity.name,
		},
		fill: {
			applied: systemProps.ref.fill.applied.name,
			final: systemProps.ref.fill.$root.name,
			opacity: systemProps.ref.fill.opacity.name,
		},
		stroke: {
			applied: systemProps.ref.stroke.applied.name,
			final: systemProps.ref.stroke.$root.name,
			opacity: systemProps.ref.stroke.opacity.name,
		},
		'accent-color': {
			applied: systemProps.ref.accent.applied.name,
			final: systemProps.ref.accent.$root.name,
			opacity: systemProps.ref.accent.opacity.name,
		},
	};
}
