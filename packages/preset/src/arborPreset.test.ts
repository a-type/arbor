import { expect, it } from 'vitest';
import { createArbor } from './createArborPreset.js';

it('compiles', () => {
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

	expect(preset.primitives.colors.light.colors.primary).toBeDefined();
});

it('supports a custom token prefix', () => {
	const preset = createArbor({ tokenPrefix: '--acme-' }).preset({
		colors: {
			ranges: {
				primary: {
					hue: 30,
				},
			},
			mainColor: 'primary',
		},
	});

	expect(preset.meta?.tokenPrefix).toBe('--acme-');
	expect(preset.$.mode.color.main.$root.name.startsWith('--acme-')).toBe(true);
	expect(preset.$.system.ref.fg.$root.name.startsWith('--acme-')).toBe(true);
});
