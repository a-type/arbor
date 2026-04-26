import { createGlobalProps, PrimitiveGlobals } from '@arbor-css/globals';
import { ColorEvaluationContext } from './color';
import {
	ColorRangeConfig,
	CompiledColorRange,
	compileRange,
	createNeutralDerivedRange,
} from './ranges';
import {
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from './schemes';

export type CompiledColorRangeWithNeutral<
	TRangeConfig extends ColorRangeConfig<any>,
> = CompiledColorRange<TRangeConfig> & {
	/**
	 * An automatically-generated neutral range derived from
	 * the color range.
	 */
	neutral: CompiledColorRange<TRangeConfig>;
};

export type CompiledColorRanges<
	TRanges extends Record<string, ColorRangeConfig<any>>,
> = {
	[K in keyof TRanges]: CompiledColorRangeWithNeutral<TRanges[K]>;
};

export type CompiledColors<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
> = {
	[K in keyof TSchemes | 'light' | 'dark']: CompiledColorRanges<TRanges>;
};

export type ExtractCompiledColorRanges<
	TCompiledColors extends CompiledColors<any, any>,
> = TCompiledColors['light'];

export function compileColors<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
>({
	ranges,
	schemes: userSchemes,
	globals,
}: {
	ranges: TRanges;
	schemes: TSchemes;
	globals?: Partial<PrimitiveGlobals>;
}) {
	const globalTokens = createGlobalProps(globals ?? {});
	const evalContext: ColorEvaluationContext = {
		propSchema: globalTokens,
		appliedProperties: {
			[globalTokens.saturation.name]: globals?.saturation?.toString(),
		},
	};
	const schemes = {
		light: defaultLightScheme,
		dark: defaultDarkScheme,
		...userSchemes,
	};

	return Object.keys(schemes).reduce(
		(acc, schemeName) => {
			const scheme = schemes[schemeName as keyof TSchemes];
			acc[schemeName as keyof TSchemes] = Object.keys(ranges).reduce(
				(rangeAcc, rangeName) => {
					const rangeConfig = ranges[rangeName as keyof TRanges];

					const uncompiled = scheme.getColorRange({
						sourceHue: rangeConfig.sourceHue,
						rangeNames: rangeConfig.rangeNames,
					});

					const compiled = compileRange(uncompiled, evalContext);

					const uncompiledNeutralRange = createNeutralDerivedRange(uncompiled);

					rangeAcc[rangeName as keyof TRanges] = {
						...compiled,
						neutral: compileRange(uncompiledNeutralRange, evalContext),
					} as any;
					return rangeAcc;
				},
				{} as Record<
					keyof TRanges,
					CompiledColorRangeWithNeutral<TRanges[keyof TRanges]>
				>,
			);
			return acc;
		},
		{} as CompiledColors<TRanges, TSchemes>,
	);
}
