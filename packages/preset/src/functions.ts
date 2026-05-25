import { CreateFunction } from '@arbor-css/functions';
import { SystemTokens } from '@arbor-css/globals';
import {
	darkenColorAlteration,
	desaturateColorAlteration,
	fadeColorAlteration,
	lightenColorAlteration,
	saturateColorAlteration,
} from './commonFunctions.js';

export function createPresetFunctions(
	systemProps: SystemTokens,
	createFunctionValue: CreateFunction,
) {
	const lightenColor = createFunctionValue('lighten-color', {
		description: 'Lightens a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			lightenColorAlteration(css, systemProps, color, step),
	});

	const darkenColor = createFunctionValue('darken-color', {
		description: 'Darkens a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			darkenColorAlteration(css, systemProps, color, step),
	});

	const desaturateColor = createFunctionValue('desaturate-color', {
		description: 'Desaturates a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			desaturateColorAlteration(css, systemProps, color, step),
	});

	const saturateColor = createFunctionValue('saturate-color', {
		description: 'Saturates a color by a specified "step" value',
		parameters: ['--color', '--step'] as const,
		definition: (css, color, step) =>
			saturateColorAlteration(css, systemProps, color, step),
	});

	const fade = createFunctionValue('fade', {
		description:
			'Applies an alpha channel to a source color using CSS relative color syntax.',
		parameters: ['--color', '--opacity'] as const,
		definition: (css, color, opacity) =>
			fadeColorAlteration(css, color, opacity),
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
			css`0 0 0 ${offset} ${systemProps.meta.scheme.trueLight}, 0 0 0 calc(${size} + ${offset}) ${color}`,
	});

	return {
		lightenColor,
		darkenColor,
		desaturateColor,
		saturateColor,
		fade,
		ring,
	} as const;
}

export type BuiltinFunctions = ReturnType<typeof createPresetFunctions>;
