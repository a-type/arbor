import {
	ColorRangeConfig,
	createColorDarkModeRange,
	createColorLightModeRange,
	UncompiledColorRange,
} from './ranges.js';

export interface SchemeDefinition<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
> {
	getColorRange: (config: RangeConfig) => UncompiledColorRange<RangeConfig>;
	tag: string;
	isDark: boolean;
}

export function createScheme<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
>(def: SchemeDefinition<RangeConfig>) {
	return def;
}

export const defaultLightScheme: SchemeDefinition = {
	tag: '☀️',
	getColorRange: createColorLightModeRange,
	isDark: false,
};

export const defaultDarkScheme: SchemeDefinition = {
	tag: '🌑',
	getColorRange: createColorDarkModeRange,
	isDark: true,
};
