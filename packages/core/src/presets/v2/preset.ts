import { Css, css, CssInterpolation, CssTemplate } from '@arbor-css/css-eval';
import { ArborPrefixConfig } from '@arbor-css/globals';
import { definePreset, PresetTokens } from '@arbor-css/preset';
import { createColorMixins } from '../basicPreset/mixins.js';
import { presetBasic } from '../basicPreset/preset.js';
import {
	ModeSchema as ArborModeSchema,
	modeSchema as createArborModeSchema,
} from './schema/schema.js';
import {
	CompileColorsOptions,
	DefaultRangeName,
} from './values/color/index.js';
import {
	createActionIntentValues,
	createBgIntentValues,
	createControlIntentValues,
	createFgIntentValues,
	createProseIntentValues,
	createSurfaceIntentValues,
} from './values/intents.js';
import {
	createColorSemanticValues,
	createDurationSemanticValues,
	createEasingSemanticValues,
	createLineWidthSemanticValues,
	createRadiusSemanticValues,
	createShadowSemanticValues,
	createSpacingSemanticValues,
	createTypographyLetterSpacingSemanticValues,
	createTypographyLineHeightSemanticValues,
	createTypographySizeSemanticValues,
	createTypographyWeightSemanticValues,
} from './values/semantics.js';
import { ShadowConfig } from './values/shadow/index.js';
import { SpacingConfig } from './values/spacing/index.js';
import { TypographyConfig } from './values/typography/index.js';

export interface ArborPresetConfig<
	TRanges extends string,
	TKeyframeName extends string = string,
> {
	prefixes?: ArborPrefixConfig;
	color: CompileColorsOptions<TRanges> & {
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
	space?: SpacingConfig & {
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
		 * A global tuning value that influences the overall "bounciness" of all easing tokens, which
		 * generally affects over/undershooting of targets.
		 * Higher values create bouncier easings. The default is 0.5, and values from 0 to 1 are recommended.
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
	keyframes?: Record<
		TKeyframeName,
		(css: CssTemplate, tokens: PresetTokens<ArborModeSchema, {}>) => Css
	>;
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
	TKeyframeNames extends string = string,
>(
	config: ArborPresetConfig<TRanges, TKeyframeNames>,
) => {
	const preset = definePreset({
		name: 'arbor',
		modeSchema: createArborModeSchema<TRanges>({
			colorNames: Object.keys(config.color.ranges) as TRanges[],
		}),
		baseMode: ($) => {
			const color = createColorSemanticValues($, config.color);
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
					space: {
						density: config.space?.globalDensity ?? 1,
						baseSize: config.space?.baseSize ?? '8px',
						scaleBase: config.space?.scaleBase ?? 2,
						scaleExponentStep: config.space?.scaleExponentStep ?? 1,
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
					ease: {
						bounciness: config.easing?.bounciness ?? 0.5,
					},
					duration: {
						slowness: config.duration?.slowness ?? 1,
						base: config.duration?.base ?? '200ms',
						min: config.duration?.min ?? '100ms',
						max: config.duration?.max ?? '500ms',
					},
				},

				/** SEMANTICS */
				color: color as any,
				tint: color[config.color.mainColor],
				gray: color[config.color.mainColor].gray,
				sp: createSpacingSemanticValues($, {
					roundToPixel: config.space?.roundToPixel ?? false,
				}),
				fs: createTypographySizeSemanticValues($, {
					roundToPixel: config.typography?.roundToPixel ?? false,
				}),
				fw: createTypographyWeightSemanticValues($),
				lh: createTypographyLineHeightSemanticValues($, {
					roundToPixel: config.typography?.roundToPixel ?? false,
				}),
				ls: createTypographyLetterSpacingSemanticValues($, {
					roundToPixel: config.typography?.roundToPixel ?? false,
				}),
				shadow: createShadowSemanticValues($),
				rd: createRadiusSemanticValues($),
				lw: createLineWidthSemanticValues($),
				ease: createEasingSemanticValues($),
				dur: createDurationSemanticValues($),

				/** INTENTS */
				fg: createFgIntentValues($),
				bg: createBgIntentValues($),
				action: createActionIntentValues($),
				control: createControlIntentValues($),
				surface: createSurfaceIntentValues($),
				prose: createProseIntentValues($),
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
						'--color': $.mode.action.primary.b.c,
					})}
					padding: ${$.mode.action.p.$root};
					border-radius: ${$.mode.action.rd};
					border-width: ${$.mode.action.primary.b.w};
					border-style: ${$.mode.action.primary.b.style};
					font-family: ${$.mode.action.text.font};
					font-size: ${$.mode.action.text.size};
					font-weight: ${$.mode.action.text.weight};
					line-height: ${$.mode.action.text.lineHeight};
					letter-spacing: ${$.mode.action.text.letterSpacing};
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
						'--color': $.mode.action.secondary.b.c,
					})}
					padding: ${$.mode.action.p.$root};
					border-radius: ${$.mode.action.rd};
					border-width: ${$.mode.action.secondary.b.w};
					border-style: ${$.mode.action.secondary.b.style};
					font-family: ${$.mode.action.text.font};
					font-size: ${$.mode.action.text.size};
					font-weight: ${$.mode.action.text.weight};
					line-height: ${$.mode.action.text.lineHeight};
					letter-spacing: ${$.mode.action.text.letterSpacing};
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
						'--color': $.mode.action.ambient.b.c,
					})}
					padding: ${$.mode.action.p.$root};
					border-radius: ${$.mode.action.rd};
					border-width: ${$.mode.action.ambient.b.w};
					border-style: ${$.mode.action.ambient.b.style};
					font-family: ${$.mode.action.text.font};
					font-size: ${$.mode.action.text.size};
					font-weight: ${$.mode.action.text.weight};
					line-height: ${$.mode.action.text.lineHeight};
					letter-spacing: ${$.mode.action.text.letterSpacing};
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
						'--color': $.mode.surface.primary.b.c,
					})}
					padding: ${$.mode.surface.p.$root};
					border-radius: ${$.mode.surface.rd};
					font-family: ${$.mode.surface.text.font};
					font-size: ${$.mode.surface.text.size};
					font-weight: ${$.mode.surface.text.weight};
					line-height: ${$.mode.surface.text.lineHeight};
					letter-spacing: ${$.mode.surface.text.letterSpacing};
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
						'--color': $.mode.surface.secondary.b.c,
					})}
					padding: ${$.mode.surface.p.$root};
					border-radius: ${$.mode.surface.rd};
					border-width: ${$.mode.surface.secondary.b.w};
					border-style: ${$.mode.surface.secondary.b.style};
					font-family: ${$.mode.surface.text.font};
					font-size: ${$.mode.surface.text.size};
					font-weight: ${$.mode.surface.text.weight};
					line-height: ${$.mode.surface.text.lineHeight};
					letter-spacing: ${$.mode.surface.text.letterSpacing};
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
						'--color': $.mode.surface.ambient.b.c,
					})}
					padding: ${$.mode.surface.p.$root};
					border-radius: ${$.mode.surface.rd};
					border-width: ${$.mode.surface.ambient.b.w};
					border-style: ${$.mode.surface.ambient.b.style};
					font-family: ${$.mode.surface.text.font};
					font-size: ${$.mode.surface.text.size};
					font-weight: ${$.mode.surface.text.weight};
					line-height: ${$.mode.surface.text.lineHeight};
					letter-spacing: ${$.mode.surface.text.letterSpacing};
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
						'--color': $.mode.control.b.c,
					})}
					padding: ${$.mode.control.p.$root};
					border-radius: ${$.mode.control.rd};
					border-width: ${$.mode.control.b.w};
					border-style: ${$.mode.control.b.style};
					font-family: ${$.mode.control.text.font};
					font-size: ${$.mode.control.text.size};
					font-weight: ${$.mode.control.text.weight};
					line-height: ${$.mode.control.text.lineHeight};
					letter-spacing: ${$.mode.control.text.letterSpacing};
				`,
			});
			const prosePrimary = create('prose-primary', {
				description:
					'Applies all primary prose intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.prose.primary.size};
					font-weight: ${$.mode.prose.primary.weight};
					font-family: ${$.mode.prose.primary.font};
					line-height: ${$.mode.prose.primary.lineHeight};
					letter-spacing: ${$.mode.prose.primary.letterSpacing};
				`,
			});
			const proseSecondary = create('prose-secondary', {
				description:
					'Applies all secondary prose intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.prose.secondary.size};
					font-weight: ${$.mode.prose.secondary.weight};
					font-family: ${$.mode.prose.secondary.font};
					line-height: ${$.mode.prose.secondary.lineHeight};
					letter-spacing: ${$.mode.prose.secondary.letterSpacing};
				`,
			});
			const proseAmbient = create('prose-ambient', {
				description:
					'Applies all ambient prose intent styles: size, weight, font, line-height, and letter-spacing.',
				definition: (css) => css`
					font-size: ${$.mode.prose.ambient.size};
					font-weight: ${$.mode.prose.ambient.weight};
					font-family: ${$.mode.prose.ambient.font};
					line-height: ${$.mode.prose.ambient.lineHeight};
					letter-spacing: ${$.mode.prose.ambient.letterSpacing};
				`,
			});

			const animation = create('animation', {
				description:
					'Applies a keyframe animation by name, with default easing and duration applied. Override defaults with regular CSS properties.',
				parameters: [
					{
						name: '--name',
						syntax:
							Object.keys(config.keyframes ?? {}).join(' | ') || '<string>',
					},
				],
				definition: (css, { parameters }) => css`
					animation-name: ${parameters[0]};
					animation-duration: ${$.mode.dur.$root};
					animation-timing-function: ${$.mode.ease.$root};

					@media (prefers-reduced-motion: reduce) {
						animation: none;
					}
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
				prosePrimary,
				proseSecondary,
				proseAmbient,

				animation,
			};
		},
		globalCss: ($) => `
			${
				config.keyframes ?
					Object.entries(config.keyframes)
						.map(
							([name, def]) => `
				@keyframes ${name} {
				  ${(def as any)(css, $).text}
				}
			`,
						)
						.join('\n')
				:	''
			}
			`,
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
