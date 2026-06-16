import { css, Css, CssInterpolation } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';

export interface TypographyLevel {
	size: string | Css;
	lineHeight: CssInterpolation;
	letterSpacing: string | Css;
}

export interface RequiredTokens {
	density: Token;
	// used to adjust for the irradiation illusion
	whenDark: Token;
}

export function isTypographyLevel(value: any): value is TypographyLevel {
	return (
		value &&
		'size' in value &&
		'lineHeight' in value &&
		'letterSpacing' in value
	);
}

export type CompiledTypography<
	TLevels extends string = DefaultTypographyLevel,
> = {
	[K in TLevels]: TypographyLevel;
} & {
	weight: Record<
		| 'thin'
		| 'extraLight'
		| 'light'
		| 'normal'
		| 'medium'
		| 'semiBold'
		| 'bold'
		| 'extraBold'
		| 'black',
		string | Css
	>;
};

export const defaultTypographyLevels = [
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'3xl',
	'4xl',
	'5xl',
	'6xl',
] as const;
export type DefaultTypographyLevel = (typeof defaultTypographyLevels)[number];

export type TypographyConfig<TLevels extends string = DefaultTypographyLevel> =
	{
		levels?: Record<TLevels, Partial<TypographyLevel>>;
		defaultLevel?: TLevels;
		weightStep?: CssInterpolation;
		lineHeightStep?: CssInterpolation;
		minWeight?: CssInterpolation;
		maxWeight?: CssInterpolation;
		baseWeight?: CssInterpolation;
		minLineHeight?: CssInterpolation;
		maxLineHeight?: CssInterpolation;
		baseLineHeight?: CssInterpolation;
		minSize?: string | Css;
		maxSize?: string | Css;
		/**
		 * Size is scaled exponentially; this is the "base" (the
		 * number being scaled).
		 */
		sizeBase?: string | Css;
		/**
		 * Multiplied with the step index to produce an exponent
		 * for scaling sizeBase. The result is multiplied with
		 * the default font size.
		 */
		sizeExponentStep?: CssInterpolation;
		letterSpacingStep?: CssInterpolation;
		minLetterSpacing?: string | Css;
		maxLetterSpacing?: string | Css;
		baseLetterSpacing?: string | Css;
		/**
		 * Apply an adjustment to font weight in dark mode to compensate for the irradiation illusion.
		 * Defaults to 0. Adjusting weight can lead to irregular font size between light and dark mode;
		 * prefer adjusting GRAD in variable fonts.
		 */
		darkModeWeightAdjustment?: CssInterpolation;
	};

export function compileTypography<
	TLevels extends string = DefaultTypographyLevel,
>(
	config: TypographyConfig<TLevels>,
	tokens: RequiredTokens,
): CompiledTypography<TLevels> {
	const levelNames =
		config.levels ?
			Object.keys(config.levels)
		:	(defaultTypographyLevels as unknown as TLevels[]);
	const baseIndex =
		// user passed an explicit value
		config.defaultLevel ? levelNames.indexOf(config.defaultLevel)
			// user did not give us one, but did supply custom levels
		: config.levels ? Math.floor(levelNames.length / 2)
			// we're using default levels, and md is the base.
		: levelNames.indexOf('md' as TLevels);

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TLevels;
			const levelConfig = config.levels?.[nameCast] ?? {};
			acc[nameCast] = {
				size: css`calc(clamp(${config.minSize ?? '0.75rem'}, 1rem * pow(${config.sizeBase ?? 1.125}, (${i - baseIndex} * ${config.sizeExponentStep ?? 1})) / ${[tokens.density, 1]}, ${config.maxSize ?? '3rem'}))`,
				lineHeight: css`calc(clamp(${config.minLineHeight ?? 0.75}, (${config.baseLineHeight ?? 1.5} - ${config.lineHeightStep ?? 0.5} * ${i - baseIndex}), ${config.maxLineHeight ?? 2}))`,
				letterSpacing: css`calc(clamp(${config.minLetterSpacing ?? 0}, (${config.baseLetterSpacing ?? 0} + ${config.letterSpacingStep ?? 0} * ${i - baseIndex}), ${config.maxLetterSpacing ?? 0}))`,
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TLevels, TypographyLevel>,
	) as CompiledTypography<TLevels>;

	const weights = [
		'thin',
		'light',
		'normal',
		'semiBold',
		'bold',
		'black',
	].reduce(
		(acc, weightName, i) => {
			const stepsFromNormal = i - 2; // normal is the 3rd item in the list (index 2)
			acc[weightName as keyof CompiledTypography['weight']] =
				css`calc(clamp(${config.minWeight ?? 100}, ${config.baseWeight ?? 400} + ${config.weightStep ?? 100} * ${stepsFromNormal} - (${tokens.whenDark} * ${config.darkModeWeightAdjustment ?? 0}), ${config.maxWeight ?? 900}))`;
			return acc;
		},
		{} as Record<keyof CompiledTypography['weight'], string | Css>,
	);

	return {
		...levels,
		weight: weights,
	};
}
