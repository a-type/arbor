import { TokenPurpose } from '@arbor-css/core';
import { Theme as MiniTheme, ThemeAnimation } from '@unocss/preset-mini';

export type Theme = {
	[Purpose in TokenPurpose]: Record<string, string>;
} & {
	breakpoints: Record<string, string>;
	verticalBreakpoints: Record<string, string>;
	containers: Record<string, string>;
	animation: ThemeAnimation;
	easing: MiniTheme['easing'];
} & {
	[K in string]: any;
};
