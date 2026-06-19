import { css, CssInterpolation } from '@arbor-css/css-eval';
import { ArborPrefixConfig } from '@arbor-css/globals';
import { ModeValues } from '@arbor-css/modes';
import { definePreset } from '@arbor-css/preset';
import { createColorMixins } from '../basicPreset/mixins.js';
import { presetBasic } from '../basicPreset/preset.js';
import {
	ArborModeSchema,
	createArborModeSchema,
} from './modeSchema/modeSchema.js';
import {
	compileColors,
	CompileColorsOptions,
	DefaultRangeName,
} from './modeValues/color/index.js';
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
import { compileShadows, ShadowConfig } from './modeValues/shadow/index.js';
import { compileSpacing, SpacingConfig } from './modeValues/spacing/index.js';
import {
	compileTypography,
	TypographyConfig,
} from './modeValues/typography/index.js';

export interface ArborPresetConfig<
	TRanges extends string,
	TRangeStepNames extends string = DefaultRangeName,
> {
	prefixes?: ArborPrefixConfig;
	color: CompileColorsOptions<TRanges, TRangeStepNames> & {
		mainColor: string;
		defaultScheme?: 'light' | 'dark';
		/**
		 * This saturation tuning value affects every color used in
		 * your mode. It multiplies with any per-color-range saturation
		 * values you set up. Default is 0.5.
		 *
		 * Any valid CSS number value can be used here.
		 */
		globalSaturation?: CssInterpolation;
	};
	typography?: TypographyConfig & {
		/**
		 * Specify a global font size. This is not recommended;
		 * the default "1em" respects the end user's font size
		 * preference. If customized, consider still using
		 * em units.
		 *
		 * Any valid CSS font-size value can be used here.
		 */
		defaultFontSize?: CssInterpolation;
		fontSizeScaleBase?: CssInterpolation;
		fontSizeScaleExponentStep?: CssInterpolation;
		baseLetterSpacing?: CssInterpolation;
		baseLineHeight?: CssInterpolation;
		weightStep?: CssInterpolation;
		baseWeight?: CssInterpolation;
		darkModeWeightAdjustment?: CssInterpolation;
		letterSpacingStep?: CssInterpolation;
		minLetterSpacing?: CssInterpolation;
		maxLetterSpacing?: CssInterpolation;
		lineHeightStep?: CssInterpolation;
		maxFontSize?: CssInterpolation;
		maxLineHeight?: CssInterpolation;
		maxWeight?: CssInterpolation;
		minFontSize?: CssInterpolation;
		minLineHeight?: CssInterpolation;
		minWeight?: CssInterpolation;
	};
	spacing?: SpacingConfig & {
		/**
		 * This density tuning value affects all spacing (and font size) tokens
		 * used in your mode. It multiplies with any per-token density
		 * adjustments to create the final spacing or size value.
		 *
		 * Larger density values create *more dense* UIs,
		 * meaning smaller spacing and text. The default is 1.
		 *
		 * Any valid CSS number value can be used here.
		 */
		globalDensity?: CssInterpolation;
		/**
		 * This is the root size of your spacing scale, from which
		 * other values are derived. Default is "8px"
		 *
		 * Any valid CSS length value can be used here.
		 */
		baseSize?: CssInterpolation;
		scaleBase?: CssInterpolation;
		scaleExponentStep?: CssInterpolation;
	};
	shadow?: ShadowConfig & {
		/**
		 * Controls the spread amount of all shadows used in the mode.
		 * A value from 0 to 1 is recommended.
		 * Any valid CSS number value can be used here.
		 */
		globalSpread?: CssInterpolation;
		/**
		 * Controls the blur amount of all shadows used in the mode.
		 * A value from 0 to 1 is recommended.
		 * Any valid CSS number value can be used here.
		 */
		globalBlur?: CssInterpolation;
		/**
		 * When no shadow color is specified, this is the default.
		 * Any valid CSS color value can be used here.
		 */
		defaultColor?: CssInterpolation;
	};
	shape?: {
		/**
		 * Influences the thickness of borders. Default is 1.
		 * Any valid CSS number value can be used here.
		 */
		lineWidth?: CssInterpolation;
		/**
		 * Globally influences the corner radius values of
		 * used in the mode. Roundness also has an influence
		 * on the padding of intent tokens. Default is 0.5.
		 * A value from 0 to 1 is recommended.
		 * Any valid CSS number value can be used here.
		 */
		roundness?: CssInterpolation;
	};
	easing?: ModeValues<ArborModeSchema['easing']>;
	duration?: ModeValues<ArborModeSchema['duration']>;
	/**
	 * Turns off the automatic bundled @mode-light, @mode-dark, and @mode-inverted.
	 */
	disableAutoColorSchemes?: boolean;
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
	const preset = definePreset({
		name: 'arbor',
		modeSchema: createArborModeSchema<TRanges>({
			colorNames: Object.keys(config.color.ranges) as TRanges[],
		}),
		baseMode: ($) => {
			return {
				global: {
					color: {
						saturation: config.color?.globalSaturation ?? 0.5,
					},
					shadow: {
						blur: config.shadow?.globalBlur ?? 0.5,
						spread: config.shadow?.globalSpread ?? 0,
						color: config.shadow?.defaultColor ?? 'rgba(0 0 0 / 0.15)',
					},
					shape: {
						lineWidth: config.shape?.lineWidth ?? 1,
						roundness: config.shape?.roundness ?? 0.5,
					},
					spacing: {
						density: config.spacing?.globalDensity ?? 1,
						baseSize: config.spacing?.baseSize ?? '8px',
						scaleBase: config.spacing?.scaleBase ?? 2,
						scaleExponentStep: config.spacing?.scaleExponentStep ?? 1,
					},
					typography: {
						baseFontSize: config.typography?.defaultFontSize ?? '1em',
						fontSizeBase: config.typography?.fontSizeScaleBase ?? 1.125,
						fontSizeExponentStep:
							config.typography?.fontSizeScaleExponentStep ?? 1,
						baseLetterSpacing: config.typography?.baseLetterSpacing ?? 0,
						baseLineHeight: config.typography?.baseLineHeight ?? 1.5,
						weightStep: config.typography?.weightStep ?? 100,
						baseWeight: config.typography?.baseWeight ?? 400,
						darkModeWeightAdjustment:
							config.typography?.darkModeWeightAdjustment ?? 0,
						fontSizeScaleBase: config.typography?.fontSizeScaleBase ?? 1.125,
						fontSizeScaleExponentStep:
							config.typography?.fontSizeScaleExponentStep ?? 1,
						letterSpacingStep: config.typography?.letterSpacingStep ?? 0,
						minLetterSpacing: config.typography?.minLetterSpacing ?? 0,
						maxLetterSpacing: config.typography?.maxLetterSpacing ?? 0,
						lineHeightStep: config.typography?.lineHeightStep ?? 0.5,
						maxFontSize: config.typography?.maxFontSize ?? '10rem',
						maxLineHeight: config.typography?.maxLineHeight ?? 2,
						maxWeight: config.typography?.maxWeight ?? 900,
						minFontSize: config.typography?.minFontSize ?? '0.75rem',
						minLineHeight: config.typography?.minLineHeight ?? 0.75,
						minWeight: config.typography?.minWeight ?? 100,
					},
				},

				/** PRIMITIVES */
				primitive: {
					// NOTE: had to bypass typings for color tokens... the user-controlled
					// color names seem to really mess with this.
					color: compileColors(
						{
							ranges: config.color.ranges,
							schemes: config.color.schemes,
						},
						$.mode.global,
					) as any,
					spacing: compileSpacing(config.spacing || {}, $.mode.global),
					typography: compileTypography(
						config.typography || {},
						$.mode.global,
						$.mode.global,
					),
					shadow: compileShadows(config.shadow || {}, $.mode.global),

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
		baseModeOptions: ($) => ({
			extraCss: `
			font-size: ${$.mode.global.typography.baseFontSize.var};
			`,
		}),
		config: config.prefixes,
		mixins: (create, $) => {
			// overwrite the basic preset's border mixin to apply the user's
			// configured border width
			const newBorderMixins = createColorMixins(create, $.mode.global, {
				name: 'border',
				property: 'border-color',
				extra: () => css`
					border-style: solid;
					border-width: calc(1px * ${$.mode.global.shape.lineWidth});
				`,
			});

			// intent mixins
			const actionPrimary = create('action-primary', {
				description: 'Applies all primary action intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.action.primary.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.action.primary.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.action.primary.borderColor,
					})}
					padding: ${$.mode.action.padding.$root};
					border-radius: ${$.mode.action.radius};
					border-width: ${$.mode.action.primary.borderWidth};
					border-style: ${$.mode.action.primary.borderStyle};
				`,
			});
			const actionSecondary = create('action-secondary', {
				description: 'Applies all secondary action intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.action.secondary.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.action.secondary.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.action.secondary.borderColor,
					})}
					padding: ${$.mode.action.padding.$root};
					border-radius: ${$.mode.action.radius};
					border-width: ${$.mode.action.secondary.borderWidth};
					border-style: ${$.mode.action.secondary.borderStyle};
				`,
			});
			const actionAmbient = create('action-ambient', {
				description: 'Applies all ambient action intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.action.ambient.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.action.ambient.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.action.ambient.borderColor,
					})}
					padding: ${$.mode.action.padding.$root};
					border-radius: ${$.mode.action.radius};
					border-width: ${$.mode.action.ambient.borderWidth};
					border-style: ${$.mode.action.ambient.borderStyle};
				`,
			});
			const surfacePrimary = create('surface-primary', {
				description: 'Applies all primary surface intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.surface.primary.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.surface.primary.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.surface.primary.borderColor,
					})}
					padding: ${$.mode.surface.padding.$root};
					border-radius: ${$.mode.surface.radius};
				`,
			});
			const surfaceSecondary = create('surface-secondary', {
				description: 'Applies all secondary surface intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.surface.secondary.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.surface.secondary.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.surface.secondary.borderColor,
					})}
					padding: ${$.mode.surface.padding.$root};
					border-radius: ${$.mode.surface.radius};
					border-width: ${$.mode.surface.secondary.borderWidth};
					border-style: ${$.mode.surface.secondary.borderStyle};
				`,
			});
			const surfaceAmbient = create('surface-ambient', {
				description: 'Applies all ambient surface intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.surface.ambient.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.surface.ambient.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.surface.ambient.borderColor,
					})}
					padding: ${$.mode.surface.padding.$root};
					border-radius: ${$.mode.surface.radius};
					border-width: ${$.mode.surface.ambient.borderWidth};
					border-style: ${$.mode.surface.ambient.borderStyle};
				`,
			});
			const control = create('control', {
				description: 'Applies all control intent styles.',
				definition: (css) => css`
					${presetBasic.mixins.bg.apply({
						'--color': $.mode.control.bg,
					})}
					${presetBasic.mixins.fg.apply({
						'--color': $.mode.control.fg,
					})}
					${presetBasic.mixins.borderColor.apply({
						'--color': $.mode.control.borderColor,
					})}
					padding: ${$.mode.control.padding.$root};
					border-radius: ${$.mode.control.radius};
					border-width: ${$.mode.control.borderWidth};
					border-style: ${$.mode.control.borderStyle};
				`,
			});
			const textPrimary = create('text-primary', {
				description: 'Applies all primary text intent styles.',
				definition: (css) => css`
					font-size: ${$.mode.text.primary.size};
					font-weight: ${$.mode.text.primary.weight};
					font-family: ${$.mode.text.primary.font};
					line-height: ${$.mode.text.primary.lineHeight};
					letter-spacing: ${$.mode.text.primary.letterSpacing};
				`,
			});
			const textSecondary = create('text-secondary', {
				description: 'Applies all secondary text intent styles.',
				definition: (css) => css`
					font-size: ${$.mode.text.secondary.size};
					font-weight: ${$.mode.text.secondary.weight};
					font-family: ${$.mode.text.secondary.font};
					line-height: ${$.mode.text.secondary.lineHeight};
					letter-spacing: ${$.mode.text.secondary.letterSpacing};
				`,
			});
			const textAmbient = create('text-ambient', {
				description: 'Applies all ambient text intent styles.',
				definition: (css) => css`
					font-size: ${$.mode.text.ambient.size};
					font-weight: ${$.mode.text.ambient.weight};
					font-family: ${$.mode.text.ambient.font};
					line-height: ${$.mode.text.ambient.lineHeight};
					letter-spacing: ${$.mode.text.ambient.letterSpacing};
				`,
			});

			return {
				border: newBorderMixins.ref,
				borderLighter: newBorderMixins.lighter,
				borderHeavier: newBorderMixins.heavier,
				borderDesaturated: newBorderMixins.desaturated,
				borderSaturated: newBorderMixins.saturated,
				borderFaded: newBorderMixins.faded,

				actionPrimary,
				actionSecondary,
				actionAmbient,
				surfacePrimary,
				surfaceSecondary,
				surfaceAmbient,
				control,
				textPrimary,
				textSecondary,
				textAmbient,
			};
		},
		extends: [presetBasic],
	});

	if (!config.disableAutoColorSchemes) {
		preset.bundleMode(
			'dark',
			{},
			{
				extraCss: `
				container-type: normal;
				color-scheme: dark;
				${preset.$.mode.global.whenDark.assign(1)}
				${preset.$.mode.global.whenLight.assign(0)}
			`,
			},
		);
		preset.bundleMode(
			'light',
			{},
			{
				extraCss: `
				container-type: normal;
				color-scheme: light;
				${preset.$.mode.global.whenLight.assign(1)}
				${preset.$.mode.global.whenDark.assign(0)}
			`,
			},
		);
		// special built-in mode: @mode-inverted - easier to create here than in userland
		preset.bundleMode(
			'inverted',
			{},
			{
				extraCss: `
				@media (prefers-color-scheme: light) {
					color-scheme: dark;
				}
				@media (prefers-color-scheme: dark) {
					color-scheme: light;
				}
				@container style(${preset.$.mode.global.whenLight.name}: 1) {
					color-scheme: dark;
					${preset.$.mode.global.whenLight.assign(0)}
					${preset.$.mode.global.whenDark.assign(1)}
				}
				@container style(${preset.$.mode.global.whenDark.name}: 1) {
					color-scheme: light;
					${preset.$.mode.global.whenLight.assign(1)}
					${preset.$.mode.global.whenDark.assign(0)}
				}
				`,
			},
		);
	}

	return preset;
};

export type PresetArborModeTokens<TRangeNames extends string> = ReturnType<
	typeof presetArbor<TRangeNames>
>['$']['mode'];
