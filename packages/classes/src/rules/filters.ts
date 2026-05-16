import type { CSSValues, Rule, RuleContext } from '@unocss/core';
import { colorableShadows, globalKeywords } from '@unocss/preset-mini/utils';
import { Theme } from '../theme/types.js';
import { resolveColor } from '../util/color.js';
import { h } from '../util/h.js';

export const filterBase = {
	'--🤵-blur': ' ',
	'--🤵-brightness': ' ',
	'--🤵-contrast': ' ',
	'--🤵-drop-shadow': ' ',
	'--🤵-grayscale': ' ',
	'--🤵-hue-rotate': ' ',
	'--🤵-invert': ' ',
	'--🤵-saturate': ' ',
	'--🤵-sepia': ' ',
};
const filterBaseKeys = Object.keys(filterBase);
const filterMetaCustom = {
	preflightKeys: filterBaseKeys,
};
const filterProperty =
	'var(--🤵-blur) var(--🤵-brightness) var(--🤵-contrast) var(--🤵-drop-shadow) var(--🤵-grayscale) var(--🤵-hue-rotate) var(--🤵-invert) var(--🤵-saturate) var(--🤵-sepia)';

export const backdropFilterBase = {
	'--🤵-backdrop-blur': ' ',
	'--🤵-backdrop-brightness': ' ',
	'--🤵-backdrop-contrast': ' ',
	'--🤵-backdrop-grayscale': ' ',
	'--🤵-backdrop-hue-rotate': ' ',
	'--🤵-backdrop-invert': ' ',
	'--🤵-backdrop-opacity': ' ',
	'--🤵-backdrop-saturate': ' ',
	'--🤵-backdrop-sepia': ' ',
};
const backdropFilterBaseKeys = Object.keys(backdropFilterBase);
const backdropMetaCustom = {
	preflightKeys: backdropFilterBaseKeys,
};
const backdropFilterProperty =
	'var(--🤵-backdrop-blur) var(--🤵-backdrop-brightness) var(--🤵-backdrop-contrast) var(--🤵-backdrop-grayscale) var(--🤵-backdrop-hue-rotate) var(--🤵-backdrop-invert) var(--🤵-backdrop-opacity) var(--🤵-backdrop-saturate) var(--🤵-backdrop-sepia)';

const composeMetaCustom = {
	preflightKeys: [...filterBaseKeys, ...backdropFilterBaseKeys],
};

function percentWithDefault(str?: string) {
	let v = h.bracket.cssvar(str || '');
	if (v != null) return v;

	v = str ? h.percent(str) : '1';
	if (v != null && Number.parseFloat(v) <= 1) return v;
}

function toFilter(
	varName: string,
	resolver: (str: string, theme: Theme) => string | undefined,
) {
	return (
		[, b, s]: string[],
		{ theme }: RuleContext<Theme>,
	): CSSValues | undefined => {
		const value = resolver(s, theme) ?? (s === 'none' ? '0' : '');
		if (value !== '') {
			if (b) {
				return {
					[`--🤵-${b}${varName}`]: `${varName}(${value})`,
					'-webkit-backdrop-filter': backdropFilterProperty,
					'backdrop-filter': backdropFilterProperty,
				};
			} else {
				return {
					[`--🤵-${varName}`]: `${varName}(${value})`,
					filter: filterProperty,
				};
			}
		}
	};
}

function dropShadowResolver([, s]: string[], { theme }: RuleContext<Theme>) {
	let v = theme.dropShadow?.[s || 'DEFAULT'];
	if (v != null) {
		const shadows = colorableShadows(v, '--🤵-drop-shadow-color');
		return {
			'--🤵-drop-shadow': `drop-shadow(${shadows.join(') drop-shadow(')})`,
			filter: filterProperty,
		};
	}

	v = h.bracket.cssvar(s);
	if (v != null) {
		return {
			'--🤵-drop-shadow': `drop-shadow(${v})`,
			filter: filterProperty,
		};
	}
}

export const filters: Rule<Theme>[] = [
	// filters
	[
		/^(?:(backdrop-)|filter-)?blur(?:-(.+))?$/,
		toFilter(
			'blur',
			(s, theme) => theme.blur?.[s || 'DEFAULT'] || h.bracket.cssvar.px(s),
		),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-blur-$blur',
				'blur-$blur',
				'filter-blur',
			],
		},
	],
	[
		/^(?:(backdrop-)|filter-)?brightness-(.+)$/,
		toFilter('brightness', (s) => h.bracket.cssvar.percent(s)),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-brightness-<percent>',
				'brightness-<percent>',
			],
		},
	],
	[
		/^(?:(backdrop-)|filter-)?contrast-(.+)$/,
		toFilter('contrast', (s) => h.bracket.cssvar.percent(s)),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-contrast-<percent>',
				'contrast-<percent>',
			],
		},
	],
	// drop-shadow only on filter
	[
		/^(?:filter-)?drop-shadow(?:-(.+))?$/,
		dropShadowResolver,
		{
			custom: filterMetaCustom,
			autocomplete: [
				'filter-drop',
				'filter-drop-shadow',
				'filter-drop-shadow-color',
				'drop-shadow',
				'drop-shadow-color',
				'filter-drop-shadow-$dropShadow',
				'drop-shadow-$dropShadow',
				'filter-drop-shadow-color-$colors',
				'drop-shadow-color-$colors',
				'filter-drop-shadow-color-(op|opacity)',
				'drop-shadow-color-(op|opacity)',
				'filter-drop-shadow-color-(op|opacity)-<percent>',
				'drop-shadow-color-(op|opacity)-<percent>',
			],
		},
	],
	[
		/^(?:filter-)?drop-shadow-color-(.+)$/,
		([, color], { theme }) => {
			const resolved = resolveColor(color, theme, {
				suffixes: ['shadow', 'drop-shadow'],
			});
			if (!resolved) return;

			return {
				'--🤵-drop-shadow-color': resolved.color + resolved.comment,
				'--🤵-drop-shadow-opacity': resolved.opacity,
			};
		},
	],
	[
		/^(?:filter-)?drop-shadow-color-op(?:acity)?-?(.+)$/,
		([, opacity]) => ({
			'--🤵-drop-shadow-opacity': h.bracket.percent(opacity),
		}),
	],
	[
		/^(?:(backdrop-)|filter-)?grayscale(?:-(.+))?$/,
		toFilter('grayscale', percentWithDefault),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-grayscale',
				'(backdrop|filter)-grayscale-<percent>',
				'grayscale-<percent>',
			],
		},
	],
	[
		/^(?:(backdrop-)|filter-)?hue-rotate-(.+)$/,
		toFilter('hue-rotate', (s) => h.bracket.cssvar.degree(s)),
		{ custom: composeMetaCustom },
	],
	[
		/^(?:(backdrop-)|filter-)?invert(?:-(.+))?$/,
		toFilter('invert', percentWithDefault),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-invert',
				'(backdrop|filter)-invert-<percent>',
				'invert-<percent>',
			],
		},
	],
	// opacity only on backdrop-filter
	[
		/^(backdrop-)op(?:acity)?-(.+)$/,
		toFilter('opacity', (s) => h.bracket.cssvar.percent(s)),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'backdrop-(op|opacity)',
				'backdrop-(op|opacity)-<percent>',
			],
		},
	],
	[
		/^(?:(backdrop-)|filter-)?saturate-(.+)$/,
		toFilter('saturate', (s) => h.bracket.cssvar.percent(s)),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-saturate',
				'(backdrop|filter)-saturate-<percent>',
				'saturate-<percent>',
			],
		},
	],
	[
		/^(?:(backdrop-)|filter-)?sepia(?:-(.+))?$/,
		toFilter('sepia', percentWithDefault),
		{
			custom: composeMetaCustom,
			autocomplete: [
				'(backdrop|filter)-sepia',
				'(backdrop|filter)-sepia-<percent>',
				'sepia-<percent>',
			],
		},
	],

	// base
	['filter', { filter: filterProperty }, { custom: filterMetaCustom }],
	[
		'backdrop-filter',
		{
			'-webkit-backdrop-filter': backdropFilterProperty,
			'backdrop-filter': backdropFilterProperty,
		},
		{ custom: backdropMetaCustom },
	],

	// nones
	['filter-none', { filter: 'none' }],
	[
		'backdrop-filter-none',
		{
			'-webkit-backdrop-filter': 'none',
			'backdrop-filter': 'none',
		},
	],

	...globalKeywords.map(
		(keyword) => [`filter-${keyword}`, { filter: keyword }] as Rule<Theme>,
	),
	...globalKeywords.map(
		(keyword) =>
			[
				`backdrop-filter-${keyword}`,
				{
					'-webkit-backdrop-filter': keyword,
					'backdrop-filter': keyword,
				},
			] as Rule<Theme>,
	),
];
