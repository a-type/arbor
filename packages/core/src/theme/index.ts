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

		preflightBase: {
			...baseTheme.preflightBase,
			'--ar-ring-inset': '0',
			'--ar-ring-width': '1px',
			'--ar-shadow': '0 0 #0000',
			'--ar-inset-shadow': '0 0 #0000',
			'--ar-inset-ring-shadow': '0 0 #0000',
			'--ar-ring-offset-shadow': '0 0 #0000',
			'--ar-ring-offset-color': '#fff',
			'--ar-ring-offset-width': '0',
		},
	};
}
