import { css, CssInterpolation } from '@arbor-css/css-eval';
import { ArborPrefixConfig } from '@arbor-css/globals';
import { definePreset } from '@arbor-css/preset';
import { createColorMixins } from '../basicPreset/mixins.js';
import { presetBasic } from '../basicPreset/preset.js';
import { createArborModeSchema } from './modeSchema/modeSchema.js';
import {
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
	createTypographySemanticValues,
} from './modeValues/semantics.js';
import { ShadowConfig } from './modeValues/shadow/index.js';
import { SpacingConfig } from './modeValues/spacing/index.js';
import { TypographyConfig } from './modeValues/typography/index.js';

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
		 * A global tuning value that influences the overall size of all typography tokens.
		 * The default is 1, and values from 0.5 to 2 are recommended.
		 * Any valid CSS number value can be used here.
		 */
		size?: CssInterpolation;
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
		/**
		 * An overall scaling factor for how heavy font weight tokens are. Default is 0.5.
		 * Any valid CSS number value can be used here.
		 */
		boldness?: CssInterpolation;
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
		 * on the padding of intent tokens. Default is 1.
		 * A value from 0 to 2 is recommended, but this is all
		 * relative and the default is somewhat arbitrary to begin with.
		 * Any valid CSS number value can be used here.
		 */
		roundness?: CssInterpolation;
	};
	easing?: {
		/**
		 * A global tuning value that influences the overall "bounciness" of all easing tokens.
		 * Higher values create bouncier easings. The default is 1, and values from 0.5 to 2 are recommended.
		 * Any valid CSS number value can be used here.
		 */
		bounciness?: CssInterpolation;
	};
	duration?: {
		/**
		 * A global tuning value that influences the overall "slowness" of all duration tokens.
		 * Higher values create slower durations. The default is 1, and values from 0.5 to 2 are recommended.
		 * Any valid CSS number value can be used here.
		 */
		slowness?: CssInterpolation;
		base?: CssInterpolation;
		min?: CssInterpolation;
		max?: CssInterpolation;
	};
	/**
	 * Turns off the automatic bundled @mode-light, @mode-dark, and @mode-inverted.
	 */
	disableAutoColorSchemes?: boolean;
}

/**
 * Adds opinionated tokens and a full-featured mode
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
						roundness: config.shape?.roundness ?? 1,
					},
					spacing: {
						density: config.spacing?.globalDensity ?? 1,
						baseSize: config.spacing?.baseSize ?? '8px',
						scaleBase: config.spacing?.scaleBase ?? 2,
						scaleExponentStep: config.spacing?.scaleExponentStep ?? 1,
					},
					typography: {
						size: config.typography?.size ?? 1,
						baseFontSize: config.typography?.defaultFontSize ?? '1em',
						fontSizeExponentStep:
							config.typography?.fontSizeScaleExponentStep ?? 1,
						baseLetterSpacing: config.typography?.baseLetterSpacing ?? 0,
						baseLineHeight: config.typography?.baseLineHeight ?? 1.5,
						weightStep: config.typography?.weightStep ?? 100,
						baseWeight: config.typography?.baseWeight ?? 400,
						darkModeWeightAdjustment:
							config.typography?.darkModeWeightAdjustment ?? 0,
						fontSizeScaleBase: config.typography?.fontSizeScaleBase ?? 1.25,
						fontSizeScaleExponentStep:
							config.typography?.fontSizeScaleExponentStep ?? 1,
						letterSpacingStep: config.typography?.letterSpacingStep ?? 0,
						minLetterSpacing: config.typography?.minLetterSpacing ?? 0,
						maxLetterSpacing: config.typography?.maxLetterSpacing ?? 0,
						maxFontSize: config.typography?.maxFontSize ?? '8rem',
						minLineHeight: config.typography?.minLineHeight ?? 0.85,
						maxLineHeight: config.typography?.maxLineHeight ?? 1.8,
						lineHeightStep: config.typography?.lineHeightStep ?? 0.75,
						maxWeight: config.typography?.maxWeight ?? 900,
						minFontSize: config.typography?.minFontSize ?? '0.75rem',
						minWeight: config.typography?.minWeight ?? 100,
						boldness: config.typography?.boldness ?? 0.5,
					},
					easing: {
						bounciness: config.easing?.bounciness ?? 1,
					},
					duration: {
						slowness: config.duration?.slowness ?? 1,
						base: config.duration?.base ?? '200ms',
						min: config.duration?.min ?? '100ms',
						max: config.duration?.max ?? '500ms',
					},
				},

				/** SEMANTICS */
				color: createColorSemanticValues($, config.color) as any,
				spacing: createSpacingSemanticValues($, {
					roundToPixel: config.spacing?.roundToPixel ?? false,
				}),
				typography: createTypographySemanticValues($),
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
				name: 'borderColor',
				property: 'border-color',
				extra: () => css`
					border-style: solid;
					border-width: calc(1px * ${$.mode.global.shape.lineWidth});
				`,
			});

			// intent mixins
			const actionPrimary = create('action-primary', {
				description:
					'Applies all primary action intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all secondary action intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all ambient action intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all primary surface intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all secondary surface intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all ambient surface intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all control intent styles: fg, bg, border, radius, and padding.',
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
				description:
					'Applies all primary text intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.text.primary.size};
					font-weight: ${$.mode.text.primary.weight};
					font-family: ${$.mode.text.primary.font};
					line-height: ${$.mode.text.primary.lineHeight};
					letter-spacing: ${$.mode.text.primary.letterSpacing};
				`,
			});
			const textSecondary = create('text-secondary', {
				description:
					'Applies all secondary text intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.text.secondary.size};
					font-weight: ${$.mode.text.secondary.weight};
					font-family: ${$.mode.text.secondary.font};
					line-height: ${$.mode.text.secondary.lineHeight};
					letter-spacing: ${$.mode.text.secondary.letterSpacing};
				`,
			});
			const textAmbient = create('text-ambient', {
				description:
					'Applies all ambient text intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.text.ambient.size};
					font-weight: ${$.mode.text.ambient.weight};
					font-family: ${$.mode.text.ambient.font};
					line-height: ${$.mode.text.ambient.lineHeight};
					letter-spacing: ${$.mode.text.ambient.letterSpacing};
				`,
			});

			return {
				borderColor: newBorderMixins.ref,
				borderColorLighter: newBorderMixins.lighter,
				borderColorHeavier: newBorderMixins.heavier,
				borderColorDesaturated: newBorderMixins.desaturated,
				borderColorSaturated: newBorderMixins.saturated,
				borderColorFaded: newBorderMixins.faded,

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
