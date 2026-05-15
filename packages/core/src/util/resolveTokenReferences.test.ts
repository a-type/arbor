import { createArborPreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { resolveTokenReferences } from './resolveTokenReferences.js';

const preset = createArborPreset({
	colors: {
		mainColor: 'red',
		ranges: {
			red: {
				hue: 0,
			},
		},
	},
});

it('resolves a indirect token values', () => {
	expect(
		resolveTokenReferences(
			preset,
			preset.primitives.$tokens.colors.red.$root.name,
		),
	).toBe('oklch(90% 0.15000000000000002 0)');
});

it('resolves direct token values', () => {
	expect(
		resolveTokenReferences(
			preset,
			preset.primitives.$tokens.spacing.$root.name,
		),
	).toBe('calc(calc(8px / var(--🧑-base-font-size)) * 1rem)');
});

it('resolves mode token values', () => {
	expect(
		resolveTokenReferences(
			preset,
			preset.modes.base.schema.$tokens.color.main.$root.name,
		),
	).toBe('oklch(90% 0.15000000000000002 0)');
});
