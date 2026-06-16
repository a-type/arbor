import { expect, it } from 'vitest';
import { presetArbor } from '../presets/arborPreset/preset.js';
import { generateStylesheet } from './generateStylesheet.js';

it("generates a preset's CSS, including globals, primitives, modes, and functions", () => {
	const preset = presetArbor({
		color: {
			ranges: {
				brand: { hue: 80 },
			},
			mainColor: 'brand',
		},
		globals: {
			roundness: 1,
		},
	});

	const css = generateStylesheet(preset, {});

	expect(css).toContain('--m-global-roundness: 1');
	expect(css).toContain('--m-primitive-color-brand-mid: ');
	expect(css).toContain('--m-color-main: ');
	expect(css).toContain('@function --fn-color-lighter');
});
