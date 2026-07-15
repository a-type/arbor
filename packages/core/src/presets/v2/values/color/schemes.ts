import { CssInterpolation } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';
import {
	ColorRangeConfig,
	createColorDarkModeRange,
	createColorLightModeRange,
	DefaultRangeName,
	UncompiledColorRange,
} from './ranges.js';

export interface SchemeDefinition<
	TRangeConfig extends ColorRangeConfig<TRangeNames>,
	TRangeNames extends string = DefaultRangeName,
> {
	getColorRange: (
		config: TRangeConfig & {
			hueShift?: CssInterpolation;
		},
		tokens: {
			saturation: Token;
		},
	) => UncompiledColorRange<TRangeNames>;
	tag: string;
	isDark: boolean;
}

export function createScheme<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
>(def: SchemeDefinition<RangeConfig>) {
	return def;
}

export const defaultLightScheme: SchemeDefinition<
	ColorRangeConfig<DefaultRangeName>,
	DefaultRangeName
> = {
	tag: 'light',
	getColorRange: createColorLightModeRange,
	isDark: false,
};

export const defaultDarkScheme: SchemeDefinition<
	ColorRangeConfig<DefaultRangeName>,
	DefaultRangeName
> = {
	tag: 'dark',
	getColorRange: createColorDarkModeRange,
	isDark: true,
};
