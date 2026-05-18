import {
	$,
	CalcEvaluationContext,
	computeEquation,
	printComputationResult,
} from '@arbor-css/calc';
import { GlobalContext } from '@arbor-css/globals';

export const defaultShadowLevels = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type DefaultShadowLevel = (typeof defaultShadowLevels)[number];

export interface ShadowConfig<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	levels?: Record<TShadowLevel, CompiledShadowLevel>;
	defaultLevel?: TShadowLevel;
	context: GlobalContext;
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
const defaultShadowBlurEquation = (step: number, context: GlobalContext) =>
	$.multiply(
		$.val(context.$systemTokens.globals.shadowBlur.varFallback('0.5')),
		$.val(context.$systemTokens.globals.baseSpacingSize.varFallback('0.5rem')),
		$.val(0.25),
		$.fn('pow', $.val(2), $.val(step - 1)),
	);
const defaultShadowSpreadEquation = (step: number, context: GlobalContext) =>
	$.multiply(
		$.val(context.$systemTokens.globals.shadowSpread.varFallback('1')),
		$.val('1px'),
	);
const defaultShadowColorEquation = (step: number, context: GlobalContext) =>
	$.val(
		context.$systemTokens.dynamic.shadowColor.varFallback(
			context.$systemTokens.globals.defaultShadowColor.var,
		),
	);

export function compileShadows<
	TShadowLevel extends string = DefaultShadowLevel,
>(config: ShadowConfig<TShadowLevel>): CompiledShadows<TShadowLevel> {
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
		propertyValues: config.context.getGlobalPropertyAssignments(),
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
					computeEquation(defaultShadowBlurEquation(i, config.context), ctx),
				),
				spread: printComputationResult(
					computeEquation(defaultShadowSpreadEquation(i, config.context), ctx),
				),
				color: printComputationResult(
					computeEquation(defaultShadowColorEquation(i, config.context), ctx),
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
