import {
	ColorRangeConfig,
	compileColors,
	CompiledColors,
	SchemeDefinition,
} from '@arbor-css/colors';
import { GlobalContextConfig } from '@arbor-css/globals';
import { definePreset } from '@arbor-css/preset';
import { compileShadows, ShadowConfig } from '@arbor-css/shadows';
import { compileSpacing, SpacingConfig } from '@arbor-css/spacing';
import { compileTypography, TypographyConfig } from '@arbor-css/typography';
import { presetBasic } from '../basicPreset/preset.js';
import { createArborModeValues } from './baseModeValues.js';
import { arborModeSchema } from './modeSchema.js';

export interface ArborPresetConfig<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
> {
	config?: GlobalContextConfig;
	color: {
		ranges: TRanges;
		schemes?: TSchemes;
		mainColor: keyof TRanges;
		defaultScheme?: keyof CompiledColors<TRanges, TSchemes>;
	};
	typography?: Omit<TypographyConfig, 'context'>;
	spacing?: Omit<SpacingConfig, 'context'>;
	shadow?: Omit<ShadowConfig, 'context'>;
	easing?: Record<string, string>;
	duration?: Record<string, string>;
}

/**
 * Adds opinionated primitive tokens and a full-featured mode
 * schema on top of the basic preset's utility mixins and functions.
 */
export const presetArbor = <
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
>(
	config: ArborPresetConfig<TRanges, TSchemes>,
) => {
	const preset = definePreset({
		name: 'arbor',
		modeSchema: arborModeSchema,
		baseMode: ($) =>
			createArborModeValues({
				tokens: $,
				mainColor: config.color.mainColor as any,
			}),
		primitives: (ctx) => ({
			color: compileColors({ ...config.color, context: ctx }),
			typography: compileTypography({
				...config.typography,
				context: ctx,
			}),
			spacing: compileSpacing({
				...config.spacing,
				context: ctx,
			}),
			shadow: compileShadows({
				...config.shadow,
				context: ctx,
			}),
			easing: config.easing || {
				tight: `cubic-bezier(0.4, 0, 0.2, 1)`,
				medium: `cubic-bezier(0.4, 0, 0.2, 1)`,
				loose: `cubic-bezier(0.4, 0, 0.2, 1)`,
			},
			duration: config.duration || {
				fast: `100ms`,
				medium: `250ms`,
				slow: `500ms`,
			},
		}),
		config: config.config,
		extends: [presetBasic],
	});

	return preset;
};
