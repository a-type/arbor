import { css, Equation } from '@arbor-css/calc';

export interface TypographyLevel {
	size: string | Equation;
	weight: number | string | Equation;
	lineHeight: number | string | Equation;
}

export function isTypographyLevel(value: any): value is TypographyLevel {
	return value && 'size' in value && 'weight' in value && 'lineHeight' in value;
}

export type CompiledTypography<
	TLevels extends string = DefaultTypographyLevel,
> = {
	[K in TLevels]: TypographyLevel;
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
	};

export function compileTypography<
	TLevels extends string = DefaultTypographyLevel,
>(config: TypographyConfig<TLevels>): CompiledTypography<TLevels> {
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
				size: css`calc(1rem * pow(${config.sizeBase ?? 1.125}, (${i - baseIndex} * ${config.sizeExponentStep ?? 1})))`,
				weight: css`calc(clamp(${config.minWeight ?? 100}, ${config.baseWeight ?? 400} + ${config.weightStep ?? 25} * ${i - baseIndex}, ${config.maxWeight ?? 900}))`,
				lineHeight: css`calc(clamp(${config.minLineHeight ?? 1}, (${config.baseLineHeight ?? 1.5} - ${config.lineHeightStep ?? 0.05} * ${i - baseIndex}), ${config.maxLineHeight ?? 2}))`,
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TLevels, TypographyLevel>,
	) as CompiledTypography<TLevels>;

	return {
		...levels,
	};
}
