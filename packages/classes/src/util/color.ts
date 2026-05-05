import { $systemProps } from '@arbor-css/core';

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
