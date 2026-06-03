import { expect, it } from 'vitest';
import { presetArbor } from '../presets/arborPreset/preset.js';
import { resolveTokenReferences } from './resolveTokenReferences.js';

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

it('resolves a indirect token values', () => {
	expect(
		resolveTokenReferences(
			preset,
			preset.$.mode.primitive.color.red.$root.name,
		),
	).toBe(
		'light-dark(oklch(90% 0.15000000000000002 0), oklch(60% 0.16000000000000003 0))',
	);
});

it('resolves direct token values', () => {
	expect(
		resolveTokenReferences(preset, preset.$.mode.primitive.spacing.$root.name),
	).toBe('0.5rem');
});

it('resolves mode token values', () => {
	expect(
		resolveTokenReferences(preset, preset.$.mode.color.main.$root.name),
	).toBe(
		'light-dark(oklch(90% 0.15000000000000002 0), oklch(60% 0.16000000000000003 0))',
	);
});
