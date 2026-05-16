import { $, Equation } from '@arbor-css/calc';
import { createFunction } from '@arbor-css/functions';
import { $systemProps } from '@arbor-css/globals';
import { createToken } from '@arbor-css/tokens';

function lightDarkAlterations({
	light,
	dark,
	step,
}: {
	light: number;
	dark: number;
	step: Equation;
}) {
	return $.add(
		$.val(1),
		$.multiply(
			step,
			$.add(
				$.multiply(
					$.token($systemProps.scheme.whenLight, $.val(1)),
					$.val(light),
				),
				$.multiply(
					$.token($systemProps.scheme.whenDark, $.val(0)),
					$.val(dark),
				),
			),
		),
	);
}

export const lightenColor = createFunction('lighten-color', {
	description: 'Lightens a color by a specified "step" value',
	parameters: [
		createToken('color', { type: 'color' }),
		createToken('step', { type: 'number' }),
	],
	definition: ($, color, step) =>
		$.color({
			from: color,
			space: 'oklch',
			parts: [
				// l = (1 + (scheme(light) * 0.02 + scheme(dark) * -0.07) * step) * l
				$.multiply(
					$.val('l'),
					lightDarkAlterations({ light: 0.02, dark: -0.07, step }),
				),
				// c = (1 + (scheme(light) * -0.1 + scheme(dark) * -0.03) * step) * c
				$.multiply(
					$.val('c'),
					lightDarkAlterations({ light: -0.1, dark: -0.03, step }),
				),
				// h = h (no change)
				$.val('h'),
			],
		}),
});

export const darkenColor = createFunction('darken-color', {
	description: 'Darkens a color by a specified "step" value',
	parameters: [
		createToken('color', { type: 'color' }),
		createToken('step', { type: 'number' }),
	],
	definition: ($, color, step) =>
		$.color({
			from: color,
			space: 'oklch',
			parts: [
				// l = (1 + (scheme(light) * -0.02 + scheme(dark) * 0.12) * step) * l
				$.multiply(
					$.val('l'),
					lightDarkAlterations({ light: -0.02, dark: 0.12, step }),
				),
				// c = (1 + (scheme(light) * 0.01 + scheme(dark) * -0.09) * step) * c
				$.multiply(
					$.val('c'),
					lightDarkAlterations({ light: 0.01, dark: -0.09, step }),
				),
				// h = h (no change)
				$.val('h'),
			],
		}),
});

export const presetFunctions = [lightenColor, darkenColor];
