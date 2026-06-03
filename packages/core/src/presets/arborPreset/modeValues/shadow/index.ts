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
}

export interface CompiledShadowLevel {
	$root: string;
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

export type CompiledShadows<TShadowLevel extends string = DefaultShadowLevel> =
	{
		[K in TShadowLevel]: CompiledShadowLevel;
	};

const defaultShadowXEquation = (step: number) => $.val(`0px`);
const defaultShadowYEquation = (step: number) =>
	$.multiply($.val('1px'), $.fn('pow', $.val(2), $.val(step - 1)));
const defaultShadowBlurEquation = (step: number, context: GlobalContext) =>
	$.multiply(
		$.val(context.$systemTokens.global.shadowBlur.varFallback('0.5')),
		$.val(context.$systemTokens.global.baseSpacingSize.varFallback('0.5rem')),
		$.val(0.25),
		$.fn('pow', $.val(2), $.val(step - 1)),
	);
const defaultShadowSpreadEquation = (step: number, context: GlobalContext) =>
	$.multiply(
		$.token(context.$systemTokens.global.shadowSpread, $.val('1')),
		$.val('1px'),
	);
const defaultShadowColorEquation = (step: number, context: GlobalContext) =>
	$.token(context.$systemTokens.global.defaultShadowColor);

export function compileShadows<
	TShadowLevel extends string = DefaultShadowLevel,
>(
	config: ShadowConfig<TShadowLevel>,
	context: GlobalContext,
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
		propertyValues: context.getGlobalPropertyAssignments(),
	};

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TShadowLevel;
			const levelConfig = config.levels?.[nameCast];
			const x = printComputationResult(
				computeEquation(defaultShadowXEquation(i), ctx),
			);
			const y = printComputationResult(
				computeEquation(defaultShadowYEquation(i), ctx),
			);
			const blur = printComputationResult(
				computeEquation(defaultShadowBlurEquation(i, context), ctx),
			);
			const spread = printComputationResult(
				computeEquation(defaultShadowSpreadEquation(i, context), ctx),
			);
			const color = printComputationResult(
				computeEquation(defaultShadowColorEquation(i, context), ctx),
			);
			const $root = `${x} ${y} ${blur} ${spread} ${color}`;
			acc[nameCast] = {
				$root,
				x,
				y,
				blur,
				spread,
				color,
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TShadowLevel, CompiledShadowLevel>,
	) as CompiledShadows<TShadowLevel>;
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TShadowLevel);

	return {
		...levels,
	};
}
