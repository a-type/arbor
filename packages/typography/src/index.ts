import {
	$,
	CalcEvaluationContext,
	computeEquation,
	printComputationResult,
} from '@arbor-css/calc';
import { $globalProps, GlobalConfig } from '../../globals/dist/globalProps.js';

export interface TypographyLevel {
	size: string;
	weight: number;
	lineHeight: number;
}

export function isTypographyLevel(value: any): value is TypographyLevel {
	return value && 'size' in value && 'weight' in value && 'lineHeight' in value;
}

export interface CompiledTypography<
	TLevels extends string = DefaultTypographyLevel,
> {
	defaultLevel: TLevels;
	levels: {
		[K in TLevels]: TypographyLevel;
	} & {
		$root: TypographyLevel;
	};
}

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
		globals?: Partial<GlobalConfig>;
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

	const evalContext: CalcEvaluationContext = {
		propertyValues: {
			[$globalProps.baseFontSize.name]:
				config.globals?.baseFontSize?.toString(),
		},
	};

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TLevels;
			const levelConfig = config.levels?.[nameCast] ?? {};
			acc[nameCast] = {
				size: printComputationResult(
					computeEquation(
						typographySizeEquation(i - baseIndex, {
							min: config.minSize,
							max: config.maxSize,
						}),
						evalContext,
					),
				),
				weight: printComputationResult(
					computeEquation(typographyWeightEquation(i - baseIndex), evalContext),
				),
				lineHeight: printComputationResult(
					computeEquation(
						typographyLineHeightEquation(i - baseIndex),
						evalContext,
					),
				),
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TLevels, TypographyLevel>,
	) as CompiledTypography<TLevels>['levels'];
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TLevels);

	return {
		defaultLevel,
		levels: {
			...levels,
			$root: levels[defaultLevel],
		},
	};
}

const typographySizeEquation = (
	step: number,
	{ min = '0.875rem', max = '3rem' }: { min?: string; max?: string },
) =>
	$.fn(
		'clamp',
		$.literal(min),
		$.multiply(
			$.literal('1rem'),
			$.fn('pow', $.literal(1.125), $.literal(step)),
		),
		$.literal(max),
	);
const typographyWeightEquation = (step: number) =>
	$.add($.literal(400), $.multiply($.literal(25), $.literal(step)));

const typographyLineHeightEquation = (step: number) =>
	$.clamp(
		$.subtract($.literal(1.5), $.multiply($.literal(0.05), $.literal(step))),
		$.literal(1.1),
		$.literal(1.5),
	);
