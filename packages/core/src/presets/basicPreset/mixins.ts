import { Css, Equation } from '@arbor-css/calc';
import { ArborMixinDefinition, CreateMixin } from '@arbor-css/functions';
import { GlobalContext } from '@arbor-css/globals';
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
		defineExtraProperties,
	}: {
		name: string;
		property: string;
		defineExtraProperties?: (css: Css) => Record<string, Equation>;
	},
) {
	const refMixin = createMixinValue(name, {
		description: ({ tokens }) =>
			`Applies ${property}, and also exposes this color for reference by other mixins or functions via ${tokens.ref.name}.`,
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
	const lightenMixin = createMixinValue(`${name}-lighter`, {
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
	const darkenMixin = createMixinValue(`${name}-heavier`, {
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
	const desaturateMixin = createMixinValue(`${name}-desaturated`, {
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
	const saturateMixin = createMixinValue(`${name}-saturated`, {
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
	const fadeMixin = createMixinValue(`${name}-faded`, {
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
		lighter: lightenMixin,
		heavier: darkenMixin,
		desaturated: desaturateMixin,
		saturated: saturateMixin,
		faded: fadeMixin,
	};
}

export function createPresetMixins(
	tokens: RequiredTokens,
	createMixinValue: CreateMixin,
	context: GlobalContext,
) {
	// pre-create shadow tokens so they can be reused in both mixins
	const shadowValueToken = context.createMixinToken('shadow-value', {
		purpose: 'shadow',
		description:
			'The main stacked shadow layer used by the shadow mixin. Assign this property to apply a shadow.',
	});
	const ringValueToken = context.createMixinToken('ring-value', {
		purpose: 'shadow',
		description:
			'A "ring" shadow, often used as a focus indicator. Assign this property to apply a ring. See the "ring" function.',
	});

	const shadow = createMixinValue('shadow', {
		description:
			'Applies stacked box-shadow layers as assignable tokens, so ring and shadow portions can be assigned independently.',
		parameters: [
			{
				name: '--shadow',
				fallback: '0 0 0 0 transparent',
				type: '*',
				description:
					'The main shadow layer, often used for elevation. If not specified, no shadow is initially applied.',
			},
		] as const,
		definition: (
			css,
			{ tokens, parameters: [shadowParam] },
		): ArborMixinDefinition => ({
			[tokens.value.name]: css`
				${shadowParam}
			`,
			'box-shadow': css`
				${[ringValueToken, css`0 0 0 0 transparent`]}, ${[
					tokens.value,
					css`0 0 0 0 transparent`,
				]}
			`,
		}),
		contributeTokens: {
			value: shadowValueToken,
		},
	});
	const ring = createMixinValue('ring', {
		description:
			'Creates a solid ring using box-shadow. Combines with shadows applied via the shadow mixin.',
		parameters: [
			{
				name: '--ring',
				fallback: '0 0 0 0 transparent',
				type: '*',
				description:
					'The main shadow layer, often used for elevation. If not specified, no shadow is initially applied.',
			},
		] as const,
		definition: (
			css,
			{ tokens, parameters: [ringParam] },
		): ArborMixinDefinition => ({
			[tokens.value.name]: css`
				${ringParam}
			`,
			'box-shadow': css`
				${[tokens.value, css`0 0 0 0 transparent`]}, ${[
					shadowValueToken,
					css`0 0 0 0 transparent`,
				]}
			`,
		}),
		contributeTokens: {
			value: ringValueToken,
		},
	});

	// colors
	const fgMixins = createColorMixins(createMixinValue, tokens, {
		name: 'fg',
		property: 'color',
	});

	const bgMixins = createColorMixins(createMixinValue, tokens, {
		name: 'bg',
		property: 'background',
	});

	const borderMixins = createColorMixins(createMixinValue, tokens, {
		name: 'border',
		property: 'border-color',
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
	});

	const strokeMixins = createColorMixins(createMixinValue, tokens, {
		name: 'stroke',
		property: 'stroke',
	});

	const accentMixins = createColorMixins(createMixinValue, tokens, {
		name: 'accent',
		property: 'accent-color',
	});

	return {
		shadow,
		ring,

		accent: accentMixins.ref,
		accentLighter: accentMixins.lighter,
		accentHeavier: accentMixins.heavier,
		accentDesaturated: accentMixins.desaturated,
		accentSaturated: accentMixins.saturated,
		accentFaded: accentMixins.faded,

		bg: bgMixins.ref,
		bgLighter: bgMixins.lighter,
		bgHeavier: bgMixins.heavier,
		bgDesaturated: bgMixins.desaturated,
		bgSaturated: bgMixins.saturated,
		bgFaded: bgMixins.faded,

		border: borderMixins.ref,
		borderLighter: borderMixins.lighter,
		borderHeavier: borderMixins.heavier,
		borderDesaturated: borderMixins.desaturated,
		borderSaturated: borderMixins.saturated,
		borderFaded: borderMixins.faded,

		fill: fillMixins.ref,
		fillLighter: fillMixins.lighter,
		fillHeavier: fillMixins.heavier,
		fillDesaturated: fillMixins.desaturated,
		fillSaturated: fillMixins.saturated,
		fillFaded: fillMixins.faded,

		fg: fgMixins.ref,
		fgLighter: fgMixins.lighter,
		fgHeavier: fgMixins.heavier,
		fgDesaturated: fgMixins.desaturated,
		fgSaturated: fgMixins.saturated,
		fgFaded: fgMixins.faded,

		stroke: strokeMixins.ref,
		strokeLighter: strokeMixins.lighter,
		strokeHeavier: strokeMixins.heavier,
		strokeDesaturated: strokeMixins.desaturated,
		strokeSaturated: strokeMixins.saturated,
		strokeFaded: strokeMixins.faded,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
