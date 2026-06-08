import { css, Equation } from '@arbor-css/calc';
import { Token } from '@arbor-css/tokens';

export interface TypographyLevel {
	size: string | Equation;
	lineHeight: number | string | Equation;
	letterSpacing: string | Equation;
}

export interface RequiredTokens {
	density: Token;
}

export function isTypographyLevel(value: any): value is TypographyLevel {
	return value && 'size' in value && 'weight' in value && 'lineHeight' in value;
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
		string | Equation
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
		weightStep?: number | string | Equation;
		lineHeightStep?: number | string | Equation;
		minWeight?: number | string | Equation;
		maxWeight?: number | string | Equation;
		baseWeight?: number | string | Equation;
		minLineHeight?: number | string | Equation;
		maxLineHeight?: number | string | Equation;
		baseLineHeight?: number | string | Equation;
		minSize?: string | Equation;
		maxSize?: string | Equation;
		/**
		 * Size is scaled exponentially; this is the "base" (the
		 * number being scaled).
		 */
		sizeBase?: string | Equation;
		/**
		 * Multiplied with the step index to produce an exponent
		 * for scaling sizeBase. The result is multiplied with
		 * the default font size.
		 */
		sizeExponentStep?: number | string | Equation;
		letterSpacingStep?: number | string | Equation;
		minLetterSpacing?: string | Equation;
		maxLetterSpacing?: string | Equation;
		baseLetterSpacing?: string | Equation;
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
				weight: css`calc(clamp(${config.minWeight ?? 100}, ${config.baseWeight ?? 400} + ${config.weightStep ?? 25} * ${i - baseIndex}, ${config.maxWeight ?? 900}))`,
				lineHeight: css`calc(clamp(${config.minLineHeight ?? 1}, (${config.baseLineHeight ?? 1.5} - ${config.lineHeightStep ?? 0.05} * ${i - baseIndex}), ${config.maxLineHeight ?? 2}))`,
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
			const stepsFromNormal = i - 3; // normal is the 4th item in the list (index 3)
			acc[weightName as keyof CompiledTypography['weight']] =
				css`calc(clamp(${config.minWeight ?? 100}, ${config.baseWeight ?? 400} + ${config.weightStep ?? 25} * ${stepsFromNormal}, ${config.maxWeight ?? 900}))`;
			return acc;
		},
		{} as Record<keyof CompiledTypography['weight'], string | Equation>,
	);

	return {
		...levels,
		weight: weights,
	};
}
