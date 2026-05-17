import { expect, it } from 'vitest';
import { createArborPreset } from './createArborPreset.js';

it('compiles', () => {
	const preset = createArborPreset({
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
