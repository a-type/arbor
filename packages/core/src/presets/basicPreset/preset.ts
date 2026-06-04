import { css } from '@arbor-css/calc';
import { definePreset } from '@arbor-css/preset';
import {
	darkenColorAlteration,
	desaturateColorAlteration,
	fadeColorAlteration,
	lightenColorAlteration,
	saturateColorAlteration,
} from './commonFunctions.js';
import { createPresetMixins } from './mixins.js';

/**
 * This basic preset includes utility mixins and functions,
 * but no primitive tokens or mode schema.
 */
export const presetBasic = definePreset({
	name: 'arbor-base',
	modeSchema: {
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
	},
	baseMode: ($) => ({
		global: {
			trueLightColor: 'light-dark(white, black)',
			trueHeavyColor: 'light-dark(black, white)',
			whenLight: css`calc(${$.system.env.prefersLight} - ${$.mode.global.whenInverted})`,
			whenDark: css`calc(1 - ${$.mode.global.whenLight})`,
			whenInverted: '0',
			schemeMultiplier: css`calc(${$.mode.global.whenLight} - ${$.mode.global.whenDark})`,
		},
	}),
	mixins: (create, $) => createPresetMixins($.mode.global, create),
	functions: (create, $) => {
		const lightenColor = create('lighten-color', {
			description: 'Lightens a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				lightenColorAlteration(css, $.mode.global, color, step),
		});

		const darkenColor = create('darken-color', {
			description: 'Darkens a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				darkenColorAlteration(css, $.mode.global, color, step),
		});

		const desaturateColor = create('desaturate-color', {
			description: 'Desaturates a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				desaturateColorAlteration(css, $.mode.global, color, step),
		});

		const saturateColor = create('saturate-color', {
			description: 'Saturates a color by a specified "step" value',
			parameters: ['--color', '--step'] as const,
			definition: (css, color, step) =>
				saturateColorAlteration(css, $.mode.global, color, step),
		});

		const fade = create('fade', {
			description:
				'Applies an alpha channel to a source color using CSS relative color syntax.',
			parameters: ['--color', '--opacity'] as const,
			definition: (css, color, opacity) =>
				fadeColorAlteration(css, color, opacity),
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

		const contrastColor = create('contrast-color', {
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

		return {
			lightenColor,
			darkenColor,
			desaturateColor,
			saturateColor,
			fade,
			ring,
			contrastColor,
		} as const;
	},
});

// @ts-expect-error
presetBasic.$.mixins.kasjdkfj;
