import { GlobalConfigProps } from '@arbor-css/globals';
import {
	ColorRangeConfig,
	createColorDarkModeRange,
	createColorLightModeRange,
	UncompiledColorRange,
} from './ranges.js';

export interface SchemeDefinition<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
> {
	getColorRange: (
		config: RangeConfig,
		options: { globalProps: GlobalConfigProps },
	) => UncompiledColorRange<RangeConfig>;
	tag: string;
	isDark: boolean;
}

export function createScheme<
	RangeConfig extends ColorRangeConfig = ColorRangeConfig,
>(def: SchemeDefinition<RangeConfig>) {
	return def;
}

export const defaultLightScheme: SchemeDefinition = {
	tag: 'light',
	getColorRange: createColorLightModeRange,
	isDark: false,
};

export const defaultDarkScheme: SchemeDefinition = {
	tag: 'dark',
	getColorRange: createColorDarkModeRange,
	isDark: true,
};
