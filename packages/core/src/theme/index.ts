import { Theme, theme as baseTheme } from '@unocss/preset-mini';
import { UserPreflightOptions } from '../preflights/user';
import { makeThemeColors } from './colors';
import { themeRadius } from './radius';
import { themeSpacing } from './spacing';

export interface ThemeOptions {
	namedHues?: UserPreflightOptions['namedHues'];
}

export function makeTheme(options: ThemeOptions): Theme {
	return {
		...baseTheme,
		colors: makeThemeColors(options),
		spacing: themeSpacing,
		borderRadius: themeRadius,
	};
}
