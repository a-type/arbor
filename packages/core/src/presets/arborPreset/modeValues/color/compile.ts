import { css } from '@arbor-css/calc';
import { GlobalContext } from '@arbor-css/globals';
import {
	ColorRangeConfig,
	CompiledColorRange,
	createNeutralDerivedRange,
	DefaultRangeName,
	UncompiledColorRange,
} from './ranges.js';
import {
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from './schemes.js';

export type CompiledColorRangeWithNeutral<
	TRangeStepNames extends string = DefaultRangeName,
> = CompiledColorRange<TRangeStepNames> & {
	/**
	 * An automatically-generated neutral range derived from
	 * the color range.
	 */
	$neutral: CompiledColorRange<TRangeStepNames>;
};

export type CompiledColorRanges<
	TRangeNames extends string,
	TRangeStepNames extends string = DefaultRangeName,
> = {
	[K in TRangeNames]: CompiledColorRangeWithNeutral<TRangeStepNames>;
};

export type CompiledColors<
	TRangeNames extends string,
	TRangeStepNames extends string = DefaultRangeName,
> = CompiledColorRanges<TRangeNames, TRangeStepNames>;

export interface CompileColorsOptions<
	TRangeNames extends string,
	TRangeStepNames extends string = DefaultRangeName,
> {
	ranges: Record<TRangeNames, ColorRangeConfig<TRangeStepNames>>;
	schemes?: {
		light?: SchemeDefinition<
			ColorRangeConfig<TRangeStepNames>,
			TRangeStepNames
		>;
		dark?: SchemeDefinition<ColorRangeConfig<TRangeStepNames>, TRangeStepNames>;
	};
	invertLightDark?: boolean;
}

/**
 * Given an input set of color range configurations (hue, saturation)
 * and, optionally, specific calculations to handle light/dark schemes,
 * produces a single set of compiled color ranges which incorporates
 * light-dark logic to select the appropriate color in each scheme
 */
export function compileColors<
	TRangeNames extends string,
	TRangeStepNames extends string = DefaultRangeName,
>(
	{
		ranges,
		schemes: userSchemes,
		invertLightDark = false,
	}: CompileColorsOptions<TRangeNames, TRangeStepNames>,
	context: GlobalContext,
): CompiledColors<TRangeNames, TRangeStepNames> {
	const schemes = {
		light:
			userSchemes?.light ??
			(defaultLightScheme as SchemeDefinition<
				ColorRangeConfig<TRangeStepNames>,
				TRangeStepNames
			>),
		dark:
			userSchemes?.dark ??
			(defaultDarkScheme as SchemeDefinition<
				ColorRangeConfig<TRangeStepNames>,
				TRangeStepNames
			>),
	};

	const colors = Object.keys(ranges).reduce((colorsAcc, rangeName) => {
		const rangeConfig = ranges[rangeName as TRangeNames];
		const uncompiledLight = schemes.light.getColorRange(rangeConfig, context);
		const uncompiledDark = schemes.dark.getColorRange(rangeConfig, context);

		const combined = toLightDarkCompiled(
			invertLightDark ? uncompiledDark : uncompiledLight,
			invertLightDark ? uncompiledLight : uncompiledDark,
			context,
		);

		colorsAcc[rangeName] = combined;

		return colorsAcc;
	}, {} as any);

	return colors;
}

function toLightDarkCompiled(
	light: UncompiledColorRange<any>,
	dark: UncompiledColorRange<any>,
	context: GlobalContext,
): CompiledColorRangeWithNeutral<any> {
	const result = {} as any;
	for (const key in light) {
		const lightColor = light[key as keyof typeof light];
		const darkColor = dark[key as keyof typeof dark];
		result[key as any] =
			css`light-dark(${lightColor.equation.compiled}, ${darkColor.equation.compiled})`;
	}

	const lightNeutral = createNeutralDerivedRange(light, context);
	const darkNeutral = createNeutralDerivedRange(dark, context);

	const neutralResult = {} as any;
	for (const key in lightNeutral) {
		const lightColor = lightNeutral[key as keyof typeof lightNeutral];
		const darkColor = darkNeutral[key as keyof typeof darkNeutral];
		neutralResult[key as any] =
			css`light-dark(${lightColor.equation.compiled}, ${darkColor.equation.compiled})`;
	}

	result.$neutral = neutralResult;
	return result;
}
