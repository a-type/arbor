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
		resolveTokenReferences(preset, preset.$.primitives.color.red.$root.name),
	).toBe('oklch(90% 0.15000000000000002 0)');
});

it('resolves direct token values', () => {
	expect(
		resolveTokenReferences(preset, preset.$.primitives.spacing.$root.name),
	).toBe('0.5rem');
});

it('resolves mode token values', () => {
	expect(
		resolveTokenReferences(preset, preset.$.mode.color.main.$root.name),
	).toBe('oklch(90% 0.15000000000000002 0)');
});
