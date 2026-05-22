import { CalcInterpolation, Css } from '@arbor-css/calc';
import { CreateFunction } from '@arbor-css/functions';
import { SystemTokens } from '@arbor-css/globals';

function lightDarkAlterations(
	css: Css,
	systemProps: SystemTokens,
	{
		light,
		dark,
		step,
	}: {
		light: number;
		dark: number;
		step: CalcInterpolation;
	},
) {
	return css`calc(1 + ${step} * (${[systemProps.meta.scheme.whenLight, 1]} * ${light}) + (${[systemProps.meta.scheme.whenDark, 1]} * ${dark}))`;
}

export function createPresetFunctions(
	systemProps: SystemTokens,
	createFunctionValue: CreateFunction,
) {
	const lightenColor = createFunctionValue('lighten-color', {
		description: 'Lightens a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, systemProps, { light: 0.02, dark: -0.07, step })}) calc(c * ${lightDarkAlterations(css, systemProps, { light: -0.1, dark: -0.03, step })}) h)`,
	});

	const darkenColor = createFunctionValue('darken-color', {
		description: 'Darkens a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			css`oklch(from ${color} calc(l * ${lightDarkAlterations(css, systemProps, { light: -0.02, dark: 0.12, step })}) calc(c * ${lightDarkAlterations(css, systemProps, { light: 0.01, dark: -0.09, step })}) h)`,
	});

	const desaturateColor = createFunctionValue('desaturate-color', {
		description: 'Desaturates a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			css`oklch(from ${color} l calc(c * (1 + ${[systemProps.meta.scheme.whenLight, 1]} * 0.05 * ${step})) h)`,
	});

	const saturateColor = createFunctionValue('saturate-color', {
		description: 'Saturates a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			css`oklch(from ${color} l calc(c * (1 + ${[systemProps.meta.scheme.whenLight, 1]} * -0.05 * ${step})) h)`,
	});

	const ring = createFunctionValue('ring', {
		description: 'Creates a ring shadow. Should be used with the shadow mixin.',
		parameters: [
			'--color',
			{
				name: '--size',
				fallback: '1px',
			},
			{
				name: '--offset',
				fallback: '0px',
			},
		] as const,
		definition: (css, color, size, offset) =>
			css`0 0 0 ${offset} ${systemProps.ref.bg.$root}, 0 0 0 calc(${size} + ${offset}) ${color}`,
	});

	return {
		lightenColor,
		darkenColor,
		desaturateColor,
		saturateColor,
		ring,
	} as const;
}

export type BuiltinFunctions = ReturnType<typeof createPresetFunctions>;
