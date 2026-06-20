import { css } from '@arbor-css/css-eval';
import { definePreset } from '@arbor-css/preset';
import { SimpleTokenSchema } from '@arbor-css/tokens';
import {
	darkenColorAlteration,
	desaturateColorAlteration,
	fadeColorAlteration,
	lightenColorAlteration,
	saturateColorAlteration,
} from './commonFunctions.js';
import { createPresetMixins } from './mixins.js';

const modeSchema = {
	global: {
		trueLightColor: {
			purpose: 'color',
			description: 'Either white or black, depending on the color scheme',
		},
		trueHeavyColor: {
			purpose: 'color',
			description: 'Either white or black, depending on the color scheme',
		},
		whenLight: {
			purpose: 'scalar',
			description:
				'Resolves to 1 in light color schemes and 0 in dark color schemes.',
		},
		whenDark: {
			purpose: 'scalar',
			description:
				'Resolves to 1 in dark color schemes and 0 in light color schemes.',
		},
		whenInverted: {
			purpose: 'scalar',
			description:
				'Resolves to 1 in inverted color schemes and 0 in non-inverted color schemes.',
		},
		schemeMultiplier: {
			purpose: 'scalar',
			description:
				'Resolves to 1 in light color schemes and -1 in dark color schemes.',
		},
	},
} satisfies SimpleTokenSchema;

export type BasicPresetModeSchema = typeof modeSchema;

/**
 * This basic preset includes utility mixins and functions,
 * but no primitive tokens or mode schema.
 */
export const presetBasic = definePreset({
	name: 'arbor-base',
	modeSchema,
	baseMode: ($) => ({
		global: {
			trueLightColor: 'light-dark(white, black)',
			trueHeavyColor: 'light-dark(black, white)',
			whenLight: css`1`,
			whenDark: css`0`,
			whenInverted: css`0`,
			schemeMultiplier: css`calc(${$.mode.global.whenLight} - ${$.mode.global.whenDark})`,
		},
	}),
	baseModeOptions: ($) => ({
		extraCss: `
			container-type: normal;
			@media (prefers-color-scheme: light) {
				color-scheme: light;
				${$.mode.global.whenLight.assign(1)}
				${$.mode.global.whenDark.assign(0)}
			}
			@media (prefers-color-scheme: dark) {
				color-scheme: dark;
				${$.mode.global.whenLight.assign(0)}
				${$.mode.global.whenDark.assign(1)}
			}
		`,
	}),
	mixins: (create, $, ctx) => createPresetMixins($.mode.global, create, ctx),
	functions: (create, $) => {
		const colorLighter = create('color-lighter', {
			description: 'Lightens a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				lightenColorAlteration($.mode.global, color, step),
		});

		const colorHeavier = create('color-heavier', {
			description: 'Darkens a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				darkenColorAlteration($.mode.global, color, step),
		});

		const colorDesaturated = create('color-desaturated', {
			description: 'Desaturates a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				desaturateColorAlteration($.mode.global, color, step),
		});

		const colorSaturated = create('color-saturated', {
			description: 'Saturates a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				saturateColorAlteration($.mode.global, color, step),
		});

		const colorFaded = create('color-faded', {
			description:
				'Applies an alpha channel to a source color using CSS relative color syntax.',
			parameters: ['--color', '--opacity'] as const,
			definition: (css, color, opacity) => fadeColorAlteration(color, opacity),
		});

		const ring = create('ring', {
			description:
				'Creates a ring shadow. Should be used with the shadow mixin.',
			parameters: [
				'--color',
				{
					name: '--size',
					fallback: '1px',
				},
				{
					name: '--offset',
					fallback: '0px',
				},
			] as const,
			definition: (css, color, size, offset) =>
				css`0 0 0 ${offset} ${$.mode.global.trueLightColor}, 0 0 0 calc(${size} + ${offset}) ${color}`,
		});

		const colorContrast = create('color-contrast', {
			description:
				'Returns either black or white depending on which has better contrast with the background color. Supply a parameter to use it instead of the background.',
			parameters: [
				{
					name: '--against-color',
					fallback: $.mixins.bg.contrast!.varFallback(
						$.mixins.bg.ref.varFallback($.mode.global.trueLightColor.var),
					),
				},
			],
			definition: (css, againstColor) => css`contrast-color(${againstColor})`,
		});

		const literal = create('literal', {
			description:
				"Returns the literal value of the parameter (no-op). Wrapped values will be ignored by Arbor's validation of non-token reference values.",
			parameters: ['--value'] as const,
			definition: (css, value) => css`
				${value}
			`,
		});

		return {
			colorLighter,
			colorHeavier,
			colorDesaturated,
			colorSaturated,
			colorFaded,
			ring,
			colorContrast,
			literal,
		};
	},
});

// verify types

// @ts-expect-error
presetBasic.$.mixins.kasjdkfj;

presetBasic.$.mixins.accent.ref;
presetBasic.$.mixins.bg.ref.varFallback('red');
presetBasic.$.mixins.bg.contrast.var;
