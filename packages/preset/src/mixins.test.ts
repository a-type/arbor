import { expect, it } from 'vitest';
import { createArbor } from './createArborPreset.js';

it('adds descriptions to the built-in shadow mixin tokens', () => {
	const preset = createArbor().preset({
		colors: {
			ranges: {
				primary: {
					hue: 30,
				},
			},
			mainColor: 'primary',
		},
	});

	expect(preset.$.mixins.shadow.shadow.description).toBeTruthy();
	expect(preset.$.mixins.shadow.ring.description).toBeTruthy();
});

it('exposes built-in ref color mixins with contributed tokens', () => {
	const preset = createArbor().preset({
		colors: {
			ranges: {
				primary: {
					hue: 30,
				},
			},
			mainColor: 'primary',
		},
	});

	expect(preset.mixins.bg.name).toContain('bg');
	expect(preset.mixins.fg.name).toContain('fg');
	expect(preset.mixins.border.name).toContain('border');
	expect(preset.mixins.bg.parameters).toEqual(['--color']);
	expect(preset.mixins.fg.parameters).toEqual(['--color']);
	expect(preset.$.mixins.bg.applied.description).toBeTruthy();
	expect(preset.$.mixins.bg.final.description).toBeTruthy();
	expect(preset.$.mixins.bg.opacity.description).toBeTruthy();
	expect(preset.$.mixins.bg.contrast).toBeDefined();
	expect(preset.$.mixins.bg.contrast?.description).toBeTruthy();
});
