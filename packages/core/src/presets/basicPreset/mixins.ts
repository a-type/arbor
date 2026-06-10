import { Css, Equation } from '@arbor-css/calc';
import { CreateMixin } from '@arbor-css/functions';
import {
	darkenColorAlteration,
	desaturateColorAlteration,
	fadeColorAlteration,
	lightenColorAlteration,
	RequiredTokens,
	saturateColorAlteration,
} from './commonFunctions.js';

export function createColorMixins(
	createMixinValue: CreateMixin,
	tokens: RequiredTokens,
	{
		name,
		property,
		description,
		defineExtraProperties,
	}: {
		name: string;
		property: string;
		description: string;
		defineExtraProperties?: (css: Css) => Record<string, Equation>;
	},
) {
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
				...defineExtraProperties?.(css),
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
			contrast: {
				purpose: 'color',
				description:
					'Color used when deriving a contrast foreground from the background.',
			},
		},
	});
	const lightenMixin = createMixinValue(`${name}-lighten`, {
		description: `Lightens the ${property} color applied to ${refMixin.name} by a number of steps.`,
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
				tokens,
				source,
				step,
			),
		}),
	});
	const darkenMixin = createMixinValue(`${name}-darken`, {
		description: `Darkens the ${property} color applied to ${refMixin.name} by a number of steps.`,
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
				tokens,
				source,
				step,
			),
		}),
	});
	const desaturateMixin = createMixinValue(`${name}-desaturate`, {
		description: `Desaturates the ${property} color applied to ${refMixin.name} by a number of steps.`,
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
				tokens,
				source,
				step,
			),
		}),
	});
	const saturateMixin = createMixinValue(`${name}-saturate`, {
		description: `Saturates the ${property} color applied to ${refMixin.name} by a number of steps.`,
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
				tokens,
				source,
				step,
			),
		}),
	});
	const fadeMixin = createMixinValue(`${name}-fade`, {
		description: `Sets the ${property} color applied to ${refMixin.name} to a specific opacity.`,
		parameters: [
			'--opacity',
			{
				name: '--source',
				fallback: refMixin.contributeTokens.applied.var,
			},
		] as const,
		definition: (css, { parameters: [opacity, source] }) => ({
			[refMixin.contributeTokens.ref.name]: fadeColorAlteration(
				css,
				source,
				opacity,
			),
		}),
	});

	return {
		ref: refMixin,
		lighten: lightenMixin,
		darken: darkenMixin,
		desaturate: desaturateMixin,
		saturate: saturateMixin,
		fade: fadeMixin,
	};
}

export function createPresetMixins(
	tokens: RequiredTokens,
	createMixinValue: CreateMixin,
) {
	const shadow = createMixinValue('shadow', {
		description:
			'Applies stacked box-shadow layers as assignable tokens, so ring and shadow portions can be assigned independently.',
		definition: (css, { tokens }) => ({
			[tokens.shadow.name]: css`0 0 0 0 transparent`,
			[tokens.ring.name]: css`0 0 0 0 transparent`,
			'box-shadow': css`
				${tokens.ring}, ${tokens.shadow}
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
	const fgMixins = createColorMixins(createMixinValue, tokens, {
		name: 'fg',
		property: 'color',
		description:
			'Routes color assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
	});

	const bgMixins = createColorMixins(createMixinValue, tokens, {
		name: 'bg',
		property: 'background',
		description:
			'Routes background color assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
	});

	const borderMixins = createColorMixins(createMixinValue, tokens, {
		name: 'border',
		property: 'border-color',
		description:
			'Routes border color assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
		defineExtraProperties: (css) => ({
			'border-style': css`solid`,
			'border-width': css`
				1px
			`,
		}),
	});

	const fillMixins = createColorMixins(createMixinValue, tokens, {
		name: 'fill',
		property: 'fill',
		description:
			'Routes SVG fill assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
	});

	const strokeMixins = createColorMixins(createMixinValue, tokens, {
		name: 'stroke',
		property: 'stroke',
		description:
			'Routes SVG stroke assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
	});

	const accentMixins = createColorMixins(createMixinValue, tokens, {
		name: 'accent',
		property: 'accent-color',
		description:
			'Routes accent-color assignments through intermediate tokens to allow for runtime adjustments and cross-color references.',
	});

	return {
		shadow,

		accent: accentMixins.ref,
		accentLighten: accentMixins.lighten,
		accentDarken: accentMixins.darken,
		accentDesaturate: accentMixins.desaturate,
		accentSaturate: accentMixins.saturate,
		accentFade: accentMixins.fade,

		bg: bgMixins.ref,
		bgLighten: bgMixins.lighten,
		bgDarken: bgMixins.darken,
		bgDesaturate: bgMixins.desaturate,
		bgSaturate: bgMixins.saturate,
		bgFade: bgMixins.fade,

		border: borderMixins.ref,
		borderLighten: borderMixins.lighten,
		borderDarken: borderMixins.darken,
		borderDesaturate: borderMixins.desaturate,
		borderSaturate: borderMixins.saturate,
		borderFade: borderMixins.fade,

		fill: fillMixins.ref,
		fillLighten: fillMixins.lighten,
		fillDarken: fillMixins.darken,
		fillDesaturate: fillMixins.desaturate,
		fillSaturate: fillMixins.saturate,
		fillFade: fillMixins.fade,

		fg: fgMixins.ref,
		fgLighten: fgMixins.lighten,
		fgDarken: fgMixins.darken,
		fgDesaturate: fgMixins.desaturate,
		fgSaturate: fgMixins.saturate,
		fgFade: fgMixins.fade,

		stroke: strokeMixins.ref,
		strokeLighten: strokeMixins.lighten,
		strokeDarken: strokeMixins.darken,
		strokeDesaturate: strokeMixins.desaturate,
		strokeSaturate: strokeMixins.saturate,
		strokeFade: strokeMixins.fade,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
