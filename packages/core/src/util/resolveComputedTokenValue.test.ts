import { css } from '@arbor-css/calc';
import { expect, it } from 'vitest';
import { presetArbor } from '../presets/arborPreset/preset.js';
import { resolveComputedTokenValue } from './resolveComputedTokenValue.js';

const preset = presetArbor({
	color: {
		mainColor: 'red',
		ranges: {
			red: {
				hue: 0,
			},
		},
	},
});

it('resolves primitive token values', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.primitive.spacing.$root.name,
	);

	expect(value).toBe('0.5rem');
});

it('resolves base mode values with baking', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
	);

	expect(value).toBe('0.3333333333333333rem');
});

it('applies user property values to evaluation context', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
		{
			[preset.$.mode.global.density.name]: '2',
		},
	);

	expect(value).toBe('calc(calc(0.3333333333333333rem / 2))');
});

it('resolves equation property values from user overrides', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
		{
			[preset.$.mode.global.density.name]: css`calc(1 + 1)`,
		},
	);

	expect(value).toBe('calc(calc(0.3333333333333333rem / 2))');
});

it('returns undefined when token is unknown', () => {
	expect(resolveComputedTokenValue(preset, '--not-a-token')).toBeUndefined();
});
