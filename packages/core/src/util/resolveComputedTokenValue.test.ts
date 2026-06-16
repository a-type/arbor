import { css, CssResolutionContext } from '@arbor-css/css-eval';
import { simplifier } from '@arbor-css/css-eval/node';
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

const ctx: CssResolutionContext = {
	simplifier,
};

it('resolves primitive token values', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.primitive.spacing.$root.name,
		ctx,
	);

	expect(value).toMatchInlineSnapshot(`".5rem"`);
});

it('resolves base mode values with baking', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
		ctx,
	);

	expect(value).toMatchInlineSnapshot(`".25rem"`);
});

it('applies user property values to evaluation context', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
		{
			...ctx,
			propertyValues: {
				[preset.$.mode.global.density.name]: '2',
			},
		},
	);

	expect(value).toMatchInlineSnapshot(`".125rem"`);
});

it('resolves equation property values from user overrides', () => {
	const value = resolveComputedTokenValue(
		preset,
		preset.$.mode.spacing.sm.name,
		{
			...ctx,
			propertyValues: {
				[preset.$.mode.global.density.name]: css`calc(1 + 1)`,
			},
		},
	);

	expect(value).toMatchInlineSnapshot(`".125rem"`);
});

it('returns undefined when token is unknown', () => {
	expect(
		resolveComputedTokenValue(preset, '--not-a-token', ctx),
	).toBeUndefined();
});
