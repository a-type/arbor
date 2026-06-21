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
		shape: {
			roundness: '1',
		},
	});

	const css = generateStylesheet(preset, {});

	expect(css).toContain('--m-global-shape-roundness: 1');
	expect(css).toContain('--m-color-palette-brand-mid: ');
	expect(css).toContain('--m-color-main: ');
});
