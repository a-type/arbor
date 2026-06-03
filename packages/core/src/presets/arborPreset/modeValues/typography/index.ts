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
		minSize?: string;
		maxSize?: string;
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
				size: typographySizeEquation(i - baseIndex, {
					min: config.minSize,
					max: config.maxSize,
				}),
				weight: typographyWeightEquation(i - baseIndex),
				lineHeight: typographyLineHeightEquation(i - baseIndex),
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

const typographySizeEquation = (
	step: number,
	{ min = '0.875rem', max = '3rem' }: { min?: string; max?: string },
) => css`clamp(${min}, 1rem * pow(1.125, ${step}), ${max})`;

const typographyWeightEquation = (step: number) => css`400 + 25 * ${step}`;

const typographyLineHeightEquation = (step: number) =>
	css`clamp(1.1, (1.5 - 0.05 * ${step}), 1.5)`;
