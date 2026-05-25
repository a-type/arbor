import { CreateMixin } from '@arbor-css/functions';
import { SystemTokens } from '@arbor-css/globals';
import {
	darkenColorAlteration,
	desaturateColorAlteration,
	lightenColorAlteration,
	saturateColorAlteration,
} from './commonFunctions.js';

function createColorMixins(
	createMixinValue: CreateMixin,
	systemTokens: SystemTokens,
	{
		name,
		property,
		description,
	}: {
		name: string;
		property: string;
		description: string;
	},
) {
	const includeContrast = property === 'background';
	const refMixin = createMixinValue(name, {
		description,
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color], tokens }) => {
			return {
				[tokens.applied.name]: css`
					${color}
				`,
				[tokens.ref.name]: css`
					${tokens.applied.var}
				`,
				...(tokens.contrast ?
					{
						[tokens.contrast.name]: css`
							${tokens.applied.var}
						`,
					}
				:	{}),
				[property]: css`
					${tokens.ref.var}
				`,
			};
		},
		contributeTokens: {
			applied: {
				purpose: 'color',
				description: `The resolved source color for ${property}.`,
			},
			ref: {
				purpose: 'color',
				description: `The final ${property} value applied by Arbor.`,
			},
			...(includeContrast ?
				{
					contrast: {
						purpose: 'color',
						description:
							'Color used when deriving a contrast foreground from the background.',
					},
				}
			:	{}),
		},
	});
	const lightenMixin = createMixinValue(`${name}-lighten`, {
		description: `Lightens the ${property} color for better contrast.`,
		parameters: [
			'--step',
			{
				name: '--source',
				fallback: refMixin.contributeTokens.applied.var,
			},
		] as const,
		definition: (css, { parameters: [step, source] }) => ({
			[refMixin.contributeTokens.ref.name]: lightenColorAlteration(
				css,
				systemTokens,
				source,
				step,
			),
		}),
	});
	const darkenMixin = createMixinValue(`${name}-darken`, {
		description: `Darkens the ${property} color for better contrast.`,
		parameters: [
			'--step',
			{
				name: '--source',
				fallback: refMixin.contributeTokens.applied.var,
			},
		] as const,
		definition: (css, { parameters: [step, source] }) => ({
			[refMixin.contributeTokens.ref.name]: darkenColorAlteration(
				css,
				systemTokens,
				source,
				step,
			),
		}),
	});
	const desaturateMixin = createMixinValue(`${name}-desaturate`, {
		description: `Desaturates the ${property} color for better contrast.`,
		parameters: [
			'--step',
			{
				name: '--source',
				fallback: refMixin.contributeTokens.applied.var,
			},
		] as const,
		definition: (css, { parameters: [step, source] }) => ({
			[refMixin.contributeTokens.ref.name]: desaturateColorAlteration(
				css,
				systemTokens,
				source,
				step,
			),
		}),
	});
	const saturateMixin = createMixinValue(`${name}-saturate`, {
		description: `Saturates the ${property} color for better contrast.`,
		parameters: [
			'--step',
			{
				name: '--source',
				fallback: refMixin.contributeTokens.applied.var,
			},
		] as const,
		definition: (css, { parameters: [step, source] }) => ({
			[refMixin.contributeTokens.ref.name]: saturateColorAlteration(
				css,
				systemTokens,
				source,
				step,
			),
		}),
	});

	return {
		ref: refMixin,
		lighten: lightenMixin,
		darken: darkenMixin,
		desaturate: desaturateMixin,
		saturate: saturateMixin,
	};
}

export function createPresetMixins(
	systemProps: SystemTokens,
	createMixinValue: CreateMixin,
) {
	const shadow = createMixinValue('shadow', {
		description:
			'Seeds stacked box-shadow layers so ring and shadow portions can be assigned independently.',
		definition: (css, { tokens }) => ({
			[tokens.shadow.name]: css`0 0 0 0 transparent`,
			[tokens.ring.name]: css`0 0 0 0 transparent`,
			'box-shadow': css`
				${tokens.ring.var}, ${tokens.shadow.var}
			`,
		}),
		contributeTokens: {
			shadow: {
				purpose: 'shadow',
				description: 'The main stacked shadow layer used by the shadow mixin.',
			},
			ring: {
				purpose: 'shadow',
				description:
					'A "ring" shadow, often used as a focus indicator. See the "ring" function.',
			},
		},
	});

	// colors
	const fgMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'fg',
		property: 'color',
		description:
			'Routes color assignments through Arbor ref variables for runtime adjustments.',
	});

	const bgMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'bg',
		property: 'background',
		description:
			'Routes background color assignments through Arbor ref variables for runtime adjustments.',
	});

	const borderMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'border',
		property: 'border-color',
		description:
			'Routes border color assignments through Arbor ref variables for runtime adjustments.',
	});

	const fillMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'fill',
		property: 'fill',
		description:
			'Routes SVG fill assignments through Arbor ref variables for runtime adjustments.',
	});

	const strokeMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'stroke',
		property: 'stroke',
		description:
			'Routes SVG stroke assignments through Arbor ref variables for runtime adjustments.',
	});

	const accentMixins = createColorMixins(createMixinValue, systemProps, {
		name: 'accent',
		property: 'accent-color',
		description:
			'Routes accent-color assignments through Arbor ref variables for runtime adjustments.',
	});

	return {
		shadow,

		accent: accentMixins.ref,
		accentLighten: accentMixins.lighten,
		accentDarken: accentMixins.darken,
		accentDesaturate: accentMixins.desaturate,
		accentSaturate: accentMixins.saturate,

		bg: bgMixins.ref,
		bgLighten: bgMixins.lighten,
		bgDarken: bgMixins.darken,
		bgDesaturate: bgMixins.desaturate,
		bgSaturate: bgMixins.saturate,

		border: borderMixins.ref,
		borderLighten: borderMixins.lighten,
		borderDarken: borderMixins.darken,
		borderDesaturate: borderMixins.desaturate,
		borderSaturate: borderMixins.saturate,

		fill: fillMixins.ref,
		fillLighten: fillMixins.lighten,
		fillDarken: fillMixins.darken,
		fillDesaturate: fillMixins.desaturate,
		fillSaturate: fillMixins.saturate,

		fg: fgMixins.ref,
		fgLighten: fgMixins.lighten,
		fgDarken: fgMixins.darken,
		fgDesaturate: fgMixins.desaturate,
		fgSaturate: fgMixins.saturate,

		stroke: strokeMixins.ref,
		strokeLighten: strokeMixins.lighten,
		strokeDarken: strokeMixins.darken,
		strokeDesaturate: strokeMixins.desaturate,
		strokeSaturate: strokeMixins.saturate,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
