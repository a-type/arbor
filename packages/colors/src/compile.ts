import { CalcEvaluationContext } from '@arbor-css/calc';
import { $globalProps, GlobalConfig } from '@arbor-css/globals';
import {
	ColorRangeConfig,
	CompiledColorRange,
	compileRange,
	createNeutralDerivedRange,
} from './ranges.js';
import {
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from './schemes.js';

export type CompiledColorRangeWithNeutral<
	TRangeConfig extends ColorRangeConfig<any>,
> = CompiledColorRange<TRangeConfig> & {
	/**
	 * An automatically-generated neutral range derived from
	 * the color range.
	 */
	$neutral: CompiledColorRange<TRangeConfig>;
};

export type CompiledColorRanges<
	TRanges extends Record<string, ColorRangeConfig<any>>,
> = {
	isDark: boolean;
	colors: {
		[K in keyof TRanges]: CompiledColorRangeWithNeutral<TRanges[K]>;
	};
};

export type CompiledColors<
	TRanges extends Record<string, ColorRangeConfig<any>> = Record<
		string,
		ColorRangeConfig
	>,
	TSchemes extends Record<string, SchemeDefinition> = Record<
		string,
		SchemeDefinition
	>,
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
	schemes?: TSchemes;
	globals?: Partial<GlobalConfig>;
}) {
	const evalContext: CalcEvaluationContext = {
		propertyValues: {
			[$globalProps.saturation.name]: globals?.saturation?.toString(),
		},
	};
	const schemes = {
		light: defaultLightScheme,
		dark: defaultDarkScheme,
		...userSchemes,
	} as Record<keyof TSchemes, SchemeDefinition>;

	return Object.keys(schemes).reduce(
		(acc, schemeName) => {
			const scheme = schemes[schemeName as keyof TSchemes];
			acc[schemeName as keyof TSchemes] = {
				isDark: scheme.isDark,
				colors: Object.keys(ranges).reduce(
					(rangeAcc, rangeName) => {
						const rangeConfig = ranges[rangeName as keyof TRanges];

						const uncompiled = scheme.getColorRange(rangeConfig);

						const compiled = compileRange(uncompiled, evalContext);

						const uncompiledNeutralRange =
							createNeutralDerivedRange(uncompiled);

						rangeAcc[rangeName as keyof TRanges] = {
							...compiled,
							$neutral: compileRange(uncompiledNeutralRange, evalContext),
						} as any;
						return rangeAcc;
					},
					{} as Record<
						keyof TRanges,
						CompiledColorRangeWithNeutral<TRanges[keyof TRanges]>
					>,
				),
			};
			return acc;
		},
		{} as CompiledColors<TRanges, TSchemes>,
	);
}
