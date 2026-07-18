import { css, CssInterpolation } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';
import { GlobalTokens } from '../../schema/global.js';
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
	gray: CompiledColorRange<TRangeStepNames>;
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

export type CompiledColorRangeConfig<TRangeStepNames extends string> =
	ColorRangeConfig<TRangeStepNames> & {
		neutralSaturation?: CssInterpolation;
		hueShift?: CssInterpolation;
	};

export interface CompileColorsOptions<
	TRangeNames extends string,
	TRangeStepNames extends string = DefaultRangeName,
> {
	ranges: Record<TRangeNames, CompiledColorRangeConfig<TRangeStepNames>>;
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
	$: GlobalTokens,
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
		const rangeConfig = {
			// default values
			hueShift: 2,
			neutralSaturation: 0.15,
			...ranges[rangeName as TRangeNames],
		};
		const uncompiledLight = schemes.light.getColorRange(rangeConfig, $.color);
		const uncompiledDark = schemes.dark.getColorRange(rangeConfig, $.color);

		const combined = toLightDarkCompiled(
			invertLightDark ? uncompiledDark : uncompiledLight,
			invertLightDark ? uncompiledLight : uncompiledDark,
			$.color,
			{ neutralSaturation: rangeConfig.neutralSaturation },
		);

		colorsAcc[rangeName] = combined;

		return colorsAcc;
	}, {} as any);

	return colors;
}

function toLightDarkCompiled(
	light: UncompiledColorRange<any>,
	dark: UncompiledColorRange<any>,
	$: { saturation: Token },
	options: { neutralSaturation?: CssInterpolation } = {},
): CompiledColorRangeWithNeutral<any> {
	const result = {} as any;
	for (const key in light) {
		const lightColor = light[key as keyof typeof light];
		const darkColor = dark[key as keyof typeof dark];
		result[key as any] =
			css`light-dark(${lightColor.equation.compiled}, ${darkColor.equation.compiled})`;
	}

	const lightNeutral = createNeutralDerivedRange(light, $, {
		saturationFactor: options.neutralSaturation ?? 0.15,
	});
	const darkNeutral = createNeutralDerivedRange(dark, $, {
		saturationFactor: options.neutralSaturation ?? 0.15,
	});

	const neutralResult = {} as any;
	for (const key in lightNeutral) {
		const lightColor = lightNeutral[key as keyof typeof lightNeutral];
		const darkColor = darkNeutral[key as keyof typeof darkNeutral];
		neutralResult[key as any] =
			css`light-dark(${lightColor.equation.compiled}, ${darkColor.equation.compiled})`;
	}

	result.gray = neutralResult;
	return result;
}

/**
 * Compile a single color range.
 */
export function compileSingleColor(
	/**
	 * Provide CSS property values for the dynamic inputs
	 * of your color range.
	 *
	 * @example
	 * {
	 * 	hue: 'var(--my-hue)',
	 * 	saturation: 'var(--my-saturation)',
	 * }
	 */
	range: CompiledColorRangeConfig<string>,
	tokens: GlobalTokens,
) {
	return compileColors(
		{
			ranges: {
				dynamic: range,
			},
		},
		tokens,
	).dynamic;
}
