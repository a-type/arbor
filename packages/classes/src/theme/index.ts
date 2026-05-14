import { ArborPreset, isToken, Token } from '@arbor-css/core';
import { toFlatKeys } from '@arbor-css/util';
import { Theme as MiniTheme, theme, ThemeAnimation } from '@unocss/preset-mini';
import { Theme } from './types.js';

const extraWords = [
	'colors',
	'color',
	'typography',
	'spacing',
	'space',
	'shadows',
	'shadow',
	'text',
	'font',
	'leading',
	'weight',
	'family',
	'lineHeight',
	'size',
	'width',
	'radius',
	'borderWidth',
	'borderRadius',
	'x',
	'y',
	'offsetX',
	'offsetY',
	'blur',
	'spread',
	'padding',
	'margin',
	'spacing',
	'space',
	'gap',
];
function processKey(key: string, extraWords: string[]) {
	for (const word of extraWords) {
		key = key.replaceAll(new RegExp(`-${word}-`, 'g'), '-');
		key = key.replaceAll(new RegExp(`^${word}-`, 'g'), '');
		key = key.replaceAll(new RegExp(`-${word}$`, 'g'), '');
	}
	key = key.replaceAll('$root', '');
	key = key
		.replaceAll(/^-+/g, '')
		.replaceAll(/-+$/g, '')
		.replaceAll(/-+/g, '-');

	return key;
}

export interface ThemeConfig {
	breakpoints: Record<string, string>;
	verticalBreakpoints: Record<string, string>;
	containers: Record<string, string>;
	animation: ThemeAnimation;
	height: Record<string, string>;
	width: Record<string, string>;
}

export const defaultThemeConfig: ThemeConfig = {
	breakpoints: {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
	},
	verticalBreakpoints: {},
	containers: {},
	animation: {},
	// TODO: should these be tokens instead?
	height: {},
	width: {},
};

// keep preset-mini happy with an empty theme shape since we rely on lots of their rules still
const emptyMini: MiniTheme = {
	// these are actually useful
	transitionProperty: theme.transitionProperty,
	lineHeight: {
		1: '1',
	},
	easing: theme.easing,
	accentColor: {},
	animation: {},
	aria: {},
	backgroundColor: {},
	borderColor: {},
	borderRadius: {},
	blockSize: {},
	blur: {},
	boxShadow: {},
	breakpoints: {},
	colors: {},
	container: {},
	containers: {},
	data: {},
	dropShadow: {},
	duration: {},
	fontFamily: {},
	fontSize: {},
	fontWeight: {},
	gridAutoColumn: {},
	gridAutoRow: {},
	gridColumn: {},
	gridRow: {},
	gridTemplateColumn: {},
	gridTemplateRow: {},
	height: {},
	inlineSize: {},
	letterSpacing: {},
	lineWidth: {},
	maxBlockSize: {},
	maxHeight: {},
	maxInlineSize: {},
	minBlockSize: {},
	minHeight: {},
	minInlineSize: {},
	ringWidth: {},
	shadowColor: {},
	textColor: {},
	width: {},
	zIndex: {},
	verticalBreakpoints: {},
	maxWidth: {},
	media: {},
	minWidth: {},
	preflightBase: {},
	spacing: {},
	supports: {},
	textIndent: {},
	textShadow: {},
	textStrokeWidth: {},
	wordSpacing: {},
};

const baseValues: Partial<Theme> = {
	spacing: {
		none: '0',
	},
	'border-radius': {
		none: '0',
	},
	'border-width': {
		none: '0',
	},
	'line-height': {
		none: '0',
		normal: 'normal',
	},
	size: {
		none: '0',
		full: '100%',
	},
};

export function createTheme(
	arbor: ArborPreset<any, any>,
	breakpointConfig: ThemeConfig = defaultThemeConfig,
) {
	const flatPrimitiveTokens = toFlatKeys<Token>(
		arbor.primitives.$tokens,
		isToken,
		{ separator: '-' },
	);
	const flatModeTokens = toFlatKeys<Token>(
		arbor.modes.base.schema.$tokens,
		isToken,
		{ separator: '-' },
	);

	// split into theme categories
	const theme: Partial<Theme> = {
		...baseValues,
		meta: {
			preset: arbor,
		},
	};

	for (const rawKey in flatPrimitiveTokens) {
		const token = flatPrimitiveTokens[rawKey];
		const key = `_${processKey(rawKey, extraWords)}`;
		const themeCategory = token.purpose;
		if (!theme[themeCategory]) {
			theme[themeCategory] = {};
		}
		(theme[themeCategory] as Record<string, string>)[key] = token.var;
	}
	for (const rawKey in flatModeTokens) {
		const token = flatModeTokens[rawKey];
		const key = processKey(rawKey, extraWords);
		const themeCategory = token.purpose;
		if (!theme[themeCategory]) {
			theme[themeCategory] = {};
		}
		(theme[themeCategory] as Record<string, string>)[key] = token.var;
	}

	return {
		...(emptyMini as any),
		...breakpointConfig,
		...theme,
	} as Theme;
}
