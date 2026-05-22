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
