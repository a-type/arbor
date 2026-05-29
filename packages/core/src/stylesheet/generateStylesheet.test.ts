import { expect, it } from 'vitest';
import { presetArbor } from '../presets/arborPreset/preset.js';
import { generateStylesheet } from './generateStylesheet.js';

it("generates a preset's CSS, including primitives, modes, and functions", () => {
	const preset = presetArbor({
		color: {
			ranges: {
				brand: { hue: 80 },
			},
			mainColor: 'brand',
		},
	});

	const css = generateStylesheet(preset);

	expect(css).toContain('--p-color-brand-mid: ');
	expect(css).toContain('--m-color-main: ');
	expect(css).toContain('@function --fn-lighten-color');
});
