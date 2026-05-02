import { $, computeEquation, printComputationResult } from '@arbor-css/calc';
import { $dynamicProps } from '@arbor-css/globals';
import { $globalProps, GlobalConfig } from '../../globals/dist/globalProps.js';

export const defaultShadowLevels = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type DefaultShadowLevel = (typeof defaultShadowLevels)[number];

export interface ShadowConfig<TSpacingLevel extends string> {
	levels?: Record<TSpacingLevel, string | number>;
	defaultLevel?: TSpacingLevel;
	globals?: GlobalConfig;
}

export interface CompiledShadows<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	defaultLevel: TShadowLevel;
	levels: {
		[K in TShadowLevel]: string | number;
	};
}

const defaultShadowEquation = (step: number) =>
	$.concat(
		[
			$.literal('0px'),
			$.multiply($.literal('1px'), $.fn('pow', $.literal(2), $.literal(step))),
			$.multiply(
				$.literal('0.15px'),
				$.fn('pow', $.literal(2), $.literal(step - 1)),
			),
			$.literal($dynamicProps.shadowColor.var),
		],
		' ',
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

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TShadowLevel;
			const levelConfig = config.levels?.[nameCast]?.toString();
			acc[nameCast] =
				levelConfig ??
				printComputationResult(
					computeEquation(defaultShadowEquation(i - baseIndex), {
						propertyValues: {
							[$globalProps.spacingUnitPixels.name]:
								config.globals?.spacingUnitPixels?.toString(),
						},
					}),
				);
			return acc;
		},
		{} as Record<TShadowLevel, string>,
	) as CompiledShadows<TShadowLevel>['levels'];

	return {
		defaultLevel:
			config.defaultLevel ?? (levelNames[baseIndex] as TShadowLevel),
		levels,
	};
}
