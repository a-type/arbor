import {
	$,
	CalcEvaluationContext,
	computeEquation,
	printComputationResult,
} from '@arbor-css/calc';
import {
	GlobalConfig,
	GlobalConfigProps,
	SystemTokens,
} from '@arbor-css/globals';

export const defaultShadowLevels = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type DefaultShadowLevel = (typeof defaultShadowLevels)[number];

export interface ShadowConfig<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	levels?: Record<TShadowLevel, CompiledShadowLevel>;
	defaultLevel?: TShadowLevel;
	globals?: GlobalConfig;
}

export interface CompiledShadowLevel {
	x: string;
	y: string;
	blur: string;
	spread: string;
	color: string;
}

export function isCompiledShadowLevel(
	value: any,
): value is CompiledShadowLevel {
	return (
		value &&
		typeof value === 'object' &&
		['x', 'y', 'blur', 'spread', 'color'].every((prop) => prop in value)
	);
}

export interface CompiledShadows<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	defaultLevel: TShadowLevel;
	levels: {
		[K in TShadowLevel]: CompiledShadowLevel;
	} & {
		$root: CompiledShadowLevel;
	};
}

const defaultShadowXEquation = (step: number) => $.val(`0px`);
const defaultShadowYEquation = (step: number) =>
	$.multiply($.val('1px'), $.fn('pow', $.val(2), $.val(step - 1)));
const defaultShadowBlurEquation = (
	step: number,
	globalProps: GlobalConfigProps,
) =>
	$.multiply(
		$.val(globalProps.shadowBlur.varFallback('0.5')),
		$.val(globalProps.baseSpacingSize.varFallback('0.5rem')),
		$.val(0.25),
		$.fn('pow', $.val(2), $.val(step - 1)),
	);
const defaultShadowSpreadEquation = (
	step: number,
	globalProps: GlobalConfigProps,
) => $.multiply($.val(globalProps.shadowSpread.varFallback('1')), $.val('1px'));
const defaultShadowColorEquation = (
	step: number,
	globalProps: GlobalConfigProps,
	dynamicProps: SystemTokens['dynamic'],
) =>
	$.val(
		dynamicProps.shadowColor.varFallback(globalProps.defaultShadowColor.var),
	);

export function compileShadows<
	TShadowLevel extends string = DefaultShadowLevel,
>(
	config: ShadowConfig<TShadowLevel>,
	{
		globalProps,
		dynamicProps,
	}: {
		globalProps: GlobalConfigProps;
		dynamicProps: SystemTokens['dynamic'];
	},
): CompiledShadows<TShadowLevel> {
	const levelNames =
		config.levels ?
			Object.keys(config.levels)
		:	(defaultShadowLevels as unknown as TShadowLevel[]);

	const baseIndex =
		// user supplied explicit default level
		config.defaultLevel ? levelNames.indexOf(config.defaultLevel)
			// user did not give us a default level, but did give us custom levels, so we'll pick the middle one as the default
		: config.levels ? Math.floor(levelNames.length / 2)
			// user did not give us a default level, and is using the default levels, so we'll use 'md' as the default.
		: levelNames.indexOf('md' as TShadowLevel);

	const ctx: CalcEvaluationContext = {
		propertyValues: {
			[globalProps.defaultShadowColor.name]:
				config.globals?.defaultShadowColor?.toString(),
			[globalProps.shadowSpread.name]: config.globals?.shadowSpread?.toString(),
			[globalProps.baseSpacingSize.name]:
				config.globals?.baseSpacingSize?.toString(),
			[globalProps.shadowBlur.name]: config.globals?.shadowBlur?.toString(),
		},
	};

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TShadowLevel;
			const levelConfig = config.levels?.[nameCast];
			acc[nameCast] = {
				x: printComputationResult(
					computeEquation(defaultShadowXEquation(i), ctx),
				),
				y: printComputationResult(
					computeEquation(defaultShadowYEquation(i), ctx),
				),
				blur: printComputationResult(
					computeEquation(defaultShadowBlurEquation(i, globalProps), ctx),
				),
				spread: printComputationResult(
					computeEquation(defaultShadowSpreadEquation(i, globalProps), ctx),
				),
				color: printComputationResult(
					computeEquation(
						defaultShadowColorEquation(i, globalProps, dynamicProps),
						ctx,
					),
				),
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TShadowLevel, CompiledShadowLevel>,
	) as CompiledShadows<TShadowLevel>['levels'];
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TShadowLevel);

	return {
		defaultLevel,
		levels: {
			...levels,
			$root: levels[defaultLevel],
		},
	};
}
