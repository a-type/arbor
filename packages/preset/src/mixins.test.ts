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

	expect(preset.$.mixins.shadow.shadow.description).toBe(
		'The main stacked shadow layer used by the shadow mixin.',
	);
	expect(preset.$.mixins.shadow.ring.description).toBe(
		'The ring layer that sits in front of the shadow layer.',
	);
	expect(preset.$.mixins.shadow.ringOffset.description).toBe(
		'The ring offset layer used to separate the ring from the shadow.',
	);
});
