import {
	compileColors,
	CompileColorsOptions,
	DefaultRangeName,
} from '@arbor-css/colors';
import {
	ArborPrefixConfig,
	defaultGlobals,
	GlobalConfig,
} from '@arbor-css/globals';
import { ModeValues } from '@arbor-css/modes';
import { definePreset } from '@arbor-css/preset';
import { compileShadows, ShadowConfig } from '@arbor-css/shadows';
import { compileSpacing, SpacingConfig } from '@arbor-css/spacing';
import { compileTypography, TypographyConfig } from '@arbor-css/typography';
import { presetBasic } from '../basicPreset/preset.js';
import {
	ArborModeSchema,
	createArborModeSchema,
} from './modeSchema/modeSchema.js';
import {
	createActionIntentValues,
	createControlIntentValues,
	createSurfaceIntentValues,
	createTextIntentValues,
} from './modeValues/intents.js';
import {
	createColorSemanticValues,
	createDurationSemanticValues,
	createEasingSemanticValues,
	createLineWidthSemanticValues,
	createRadiusSemanticValues,
	createShadowSemanticValues,
	createSpacingSemanticValues,
} from './modeValues/semantics.js';

export interface ArborPresetConfig<
	TRanges extends string,
	TRangeStepNames extends string = DefaultRangeName,
> {
	prefixes?: ArborPrefixConfig;
	globals?: Partial<GlobalConfig>;
	color: CompileColorsOptions<TRanges, TRangeStepNames> & {
		mainColor: string;
		defaultScheme?: 'light' | 'dark';
	};
	typography?: TypographyConfig;
	spacing?: SpacingConfig;
	shadow?: ShadowConfig;
	easing?: ModeValues<ArborModeSchema['easing']>;
	duration?: ModeValues<ArborModeSchema['duration']>;
}

/**
 * Adds opinionated primitive tokens and a full-featured mode
 * schema on top of the basic preset's utility mixins and functions.
 */
export const presetArbor = <
	TRanges extends string,
	TRangeStepNames extends string = DefaultRangeName,
>(
	config: ArborPresetConfig<TRanges>,
) => {
	const defaultedGlobals: GlobalConfig = {
		...defaultGlobals,
		...config.globals,
	};
	const preset = definePreset({
		name: 'arbor',
		modeSchema: createArborModeSchema<TRanges>({
			colorNames: Object.keys(config.color.ranges) as TRanges[],
		}),
		baseMode: ($, ctx) => {
			// NOTE: had to bypass typings for color tokens... the user-controlled
			// color names seem to really mess with this.
			return {
				scalar: {
					density: 1,
				},

				/** PRIMITIVES */
				primitive: {
					color: compileColors(
						{
							ranges: config.color.ranges,
							schemes: config.color.schemes,
						},
						ctx,
					) as any,
					spacing: compileSpacing(config.spacing || {}, ctx),
					typography: compileTypography(config.typography || {}, ctx),
					shadow: compileShadows(config.shadow || {}, ctx),

					easing:
						config.easing ||
						({
							$root: $.mode.easing.medium,
							tight: `cubic-bezier(0.4, 0, 0.2, 1)`,
							medium: `cubic-bezier(0.4, 0, 0.2, 1)`,
							loose: `cubic-bezier(0.4, 0, 0.2, 1)`,
						} as const),
					duration:
						config.duration ||
						({
							$root: $.mode.duration.medium,
							short: `100ms`,
							medium: `250ms`,
							long: `500ms`,
						} as const),
				},

				/** SEMANTICS */
				color: createColorSemanticValues(
					$,
					config.color.mainColor as any,
				) as any,
				spacing: createSpacingSemanticValues($),
				shadow: createShadowSemanticValues($),
				radius: createRadiusSemanticValues($),
				lineWidth: createLineWidthSemanticValues($),
				easing: createEasingSemanticValues($),
				duration: createDurationSemanticValues($),

				/** INTENTS */
				action: createActionIntentValues($),
				control: createControlIntentValues($),
				surface: createSurfaceIntentValues($),
				text: createTextIntentValues($),
			};
		},
		config: {
			...config.prefixes,
			globals: defaultedGlobals,
		},
		extends: [presetBasic],
	});

	return preset;
};
