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

export type TypographyConfig<TLevels extends string> = {
	levels?: Record<TLevels, Partial<TypographyLevel>>;
	defaultLevel?: TLevels;
	globals?: Partial<GlobalConfig>;
};

export function compileTypography<TLevels extends string>(
	config: TypographyConfig<TLevels>,
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

	const evalContext: CalcEvaluationContext = {
		propertyValues: {
			[$globalProps.baseFontSizePixels.name]:
				config.globals?.baseFontSizePixels?.toString(),
		},
	};

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TLevels;
			const levelConfig = config.levels?.[nameCast] ?? {};
			acc[nameCast] = {
				size: printComputationResult(
					computeEquation(typographySizeEquation(i - baseIndex), evalContext),
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

	return {
		defaultLevel: config.defaultLevel ?? (levelNames[baseIndex] as TLevels),
		levels,
	};
}

const typographySizeEquation = (step: number) =>
	$.multiply($.literal('1rem'), $.fn('pow', $.literal(1.25), $.literal(step)));

const typographyWeightEquation = (step: number) =>
	$.add($.literal(400), $.multiply($.literal(25), $.literal(step)));

const typographyLineHeightEquation = (step: number) =>
	$.clamp(
		$.subtract($.literal(1.5), $.multiply($.literal(0.05), $.literal(step))),
		$.literal(1.1),
		$.literal(1.5),
	);
