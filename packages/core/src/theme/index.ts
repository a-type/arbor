import { Theme, theme as baseTheme } from '@unocss/preset-wind4';
import { UserPreflightOptions } from '../preflights/user';
import { makeThemeColors } from './colors';
import { themeSpacing } from './spacing';
import { themeRadius } from './themeRadius';

export interface ThemeOptions {
	namedHues?: UserPreflightOptions['namedHues'];
}

export function makeTheme(options: ThemeOptions): Theme {
	return {
		...baseTheme,
		colors: makeThemeColors(options),
		spacing: themeSpacing,
		radius: themeRadius,
	};
}
