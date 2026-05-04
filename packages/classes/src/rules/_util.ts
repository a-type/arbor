import { $systemProps } from '@arbor-css/core';
import { getByConcatKey } from '@arbor-css/util';
import { Theme } from '../theme/types.js';

export const globalKeywords = [
	'inherit',
	'initial',
	'revert',
	'revert-layer',
	'unset',
];

export const directionMap = {
	'': [''],
	l: ['inline-start'],
	r: ['inline-end'],
	t: ['block-start'],
	b: ['block-end'],
	s: ['inline-start'],
	e: ['inline-end'],
	x: ['inline'],
	y: ['block'],
	bs: ['block-start'],
	be: ['block-end'],
	is: ['inline-start'],
	ie: ['inline-end'],
	block: ['block-start', 'block-end'],
	inline: ['inline-start', 'inline-end'],
	'block-start': ['block-start'],
	'block-end': ['block-end'],
	'inline-start': ['inline-start'],
	'inline-end': ['inline-end'],
} as const;
export const directionMapEntries = Object.entries(directionMap).sort((a, b) => {
	// "" should be first, so it doesn't interfere with more specific matches
	if (a[0] === '') return -1;
	if (b[0] === '') return 1;
	return b[0].length - a[0].length;
});

function getBracketedValue(value: string) {
	const match = value.match(/^\[(.+)\]$/);
	return match ? match[1] : null;
}

export function themeOrLiteral(
	value: string,
	theme: Theme,
	{
		startFrom,
		unitForLiteralNumber,
		trySuffixes,
	}: {
		startFrom?: keyof Theme | (string & {});
		unitForLiteralNumber?: string;
		trySuffixes?: string[];
	},
): [string, { source: 'theme' | 'bracket' | 'literal' }] {
	const bracketedValue = getBracketedValue(value);
	if (bracketedValue) {
		return [bracketedValue, { source: 'bracket' }];
	}
	for (const suffix of ['', ...(trySuffixes || [])]) {
		const lookFor = dotConcat(startFrom, value, suffix);
		const themeValue = theme ? getByConcatKey(theme, lookFor, '.') : undefined;
		if (themeValue) {
			return [themeValue, { source: 'theme' }];
		}
	}

	if (unitForLiteralNumber && /^\d+$/.test(value)) {
		return [`${value}${unitForLiteralNumber}`, { source: 'literal' }];
	}

	return [value, { source: 'literal' }];
}

export function dotConcat(...parts: (string | undefined)[]) {
	return parts.filter(Boolean).join('.');
}
export function dashConcat(...parts: (string | undefined)[]) {
	return parts.filter(Boolean).join('-');
}

const systemTokenMap: Record<string, string> = {
	'@fg': $systemProps.fg.applied.var,
	'@bg': $systemProps.bg.applied.var,
	'@border': $systemProps.borderColor[''].applied.var,
	'@fill': $systemProps.fill.applied.var,
	'@stroke': $systemProps.stroke.applied.var,
};
/**
 * Parses a color value as if it were a literal (non-theme match).
 * Supports / syntax to apply opacity.
 * Opacity is returned as 0-1.
 * Supports system token mapping.
 */
export function parseColor(
	value: string,
): { color: string; opacity?: string } | undefined {
	const [color, opacity] = value.split('/');
	const opacityValueRaw = opacity ? parseInt(opacity, 10) : undefined;
	return {
		color: systemTokenMap[color] || color,
		opacity:
			opacityValueRaw !== undefined ?
				(opacityValueRaw / 100).toString()
			:	undefined,
	};
}

function mod(base: string, level: number, sign: number) {
	// TODO: not hardcode white/black... figure out how to interpret these
	// with schemes/modes
	return `color-mix(in oklch, ${base} ${50 + level * sign * 10}%, ${sign === 1 ? 'white' : 'black'})`;
}

export function lighten(base: string, level: string) {
	return mod(base, parseInt(level, 10), 1);
}

export function darken(base: string, level: string) {
	return mod(base, parseInt(level, 10), -1);
}

export const colorAlters: Record<
	string,
	(base: string, level: string) => string
> = {
	l: lighten,
	lighten,
	d: darken,
	darken,
};

export const colorAltersMatch = '(l|lighten|d|darken)';

export function dirRegex(suffix: string) {
	if (!suffix) return '';
	return `(?:-${suffix})`;
}

/**
 * Best guess at whether something is a CSS color...
 * - matching color functions like rgb() or hsl()
 * - matching hex colors like #fff or #123456
 * - matching named CSS colors like "red" (really just any lowercase word)
 * This is not perfect, but should be sufficient for distinguishing between theme keys and literal colors in most cases.
 */
export function isColorLiteral(value: string) {
	return (
		/^(?:rgb|hsl|oklch|color)\(.+\)$/.test(value) ||
		/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
		/^[a-z]+$/.test(value)
	);
}

export function isNumericUnitLiteral(value: string) {
	return /^\d+(\w{1,3}|%)$/.test(value);
}

export function isNumericLiteral(value: string) {
	return /^\d+$/.test(value);
}
