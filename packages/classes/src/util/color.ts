import { $systemProps, resolveTokenReferences } from '@arbor-css/core';
import { laterals } from '../rules/color.js';
import { Theme } from '../theme/types.js';
import { customPropertyRe } from './regex.js';
import { isNumericLiteral, isNumericUnitLiteral } from './tests.js';
import { themeOrLiteral } from './themeOrLiteral.js';

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

export function resolveColor(
	color: string,
	theme: Theme,
	{
		suffixes,
	}: {
		suffixes?: string[];
	},
): { color: string; opacity?: string; comment?: string } | undefined {
	// pre-splitting opacity and restoring it later allows
	// supporting [color]/50 syntax while detecting the color portion
	const split = color.split('/');
	const baseColor = split[0];
	const opacityPart = split[1];

	let [value, { source }] = themeOrLiteral(baseColor, theme, {
		startFrom: 'color',
		trySuffixes: suffixes,
		type: 'color',
	});
	if (!value) {
		if (baseColor in laterals) {
			value = laterals[baseColor as keyof typeof laterals];
		} else {
			return;
		}
	}
	if (isNumericLiteral(value) || isNumericUnitLiteral(value)) {
		// probably not meant for us...
		return;
	}
	const restoredOpacity = opacityPart ? `${value}/${opacityPart}` : value;
	const parsed = parseColor(restoredOpacity);
	if (!parsed) return;

	let comment = '';
	if (source === 'theme') {
		// try adding an evaluated color comment to the end
		const preset = theme.meta.preset;
		const matchedPropertyName = customPropertyRe.exec(value)?.[1];
		if (preset && matchedPropertyName) {
			const resolved = resolveTokenReferences(preset, matchedPropertyName);
			if (resolved) {
				comment = ` /* ${resolved} */`;
			}
		}
	}

	return {
		color: parsed.color,
		opacity: parsed.opacity,
		comment,
	};
}
