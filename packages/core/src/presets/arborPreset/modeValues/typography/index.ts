import { css, Css, CssInterpolation } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';
import { ArborModeGlobalTokens } from '../../modeSchema/global.js';

export interface TypographyLevel {
	size: string | Css;
	lineHeight: CssInterpolation;
	letterSpacing: string | Css;
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
		roundToPixel?: boolean;
	};

export function compileTypography<
	TLevels extends string = DefaultTypographyLevel,
>(
	config: TypographyConfig<TLevels>,
	tokens: ArborModeGlobalTokens,
	systemTokens: { whenDark: Token },
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
				size: css`calc(${config.roundToPixel ? 'round(' : ''}clamp(${tokens.typography.minFontSize ?? '0.75rem'}, 1rem * pow(${tokens.typography.fontSizeScaleBase ?? 1.125}, (${i - baseIndex} * ${tokens.typography.fontSizeScaleExponentStep ?? 1})) / ${[tokens.spacing.density, 1]}, ${tokens.typography.maxFontSize ?? '3rem'})${config.roundToPixel ? ', 1px)' : ''})`,
				lineHeight: css`calc(clamp(${tokens.typography.minLineHeight ?? 0.75}, (${tokens.typography.baseLineHeight ?? 1.5} - ${tokens.typography.lineHeightStep ?? 0.5} * ${i - baseIndex}), ${tokens.typography.maxLineHeight ?? 2}))`,
				letterSpacing: css`calc(clamp(${tokens.typography.minLetterSpacing ?? 0}, (${tokens.typography.baseLetterSpacing ?? 0} + ${tokens.typography.letterSpacingStep ?? 0} * ${i - baseIndex}), ${tokens.typography.maxLetterSpacing ?? 0}))`,
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
				css`calc(clamp(${tokens.typography.minWeight ?? 100}, ${tokens.typography.baseWeight ?? 400} + ${tokens.typography.weightStep ?? 100} * ${stepsFromNormal} - (${systemTokens.whenDark} * ${tokens.typography.darkModeWeightAdjustment ?? 0}), ${tokens.typography.maxWeight ?? 900}))`;
			return acc;
		},
		{} as Record<keyof CompiledTypography['weight'], string | Css>,
	);

	return {
		...levels,
		weight: weights,
	};
}
