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
}

export function createScheme<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
>(def: SchemeDefinition<RangeConfig>) {
	return def;
}

export const defaultLightScheme = {
	tag: '☀️',
	getColorRange: createColorLightModeRange,
};

export const defaultDarkScheme = {
	tag: '🌑',
	getColorRange: createColorDarkModeRange,
};
