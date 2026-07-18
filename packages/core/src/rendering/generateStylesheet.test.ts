import { expect, it } from 'vitest';
import { presetV1 } from '../presets/v1/preset.js';
import { generateStylesheet } from './generateStylesheet.js';

it("generates a preset's CSS, including globals, primitives, modes, and functions", () => {
	const preset = presetV1({
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
	expect(css).toContain('--m-color-brand-mid: ');
	expect(css).toContain('--m-tint: ');
});
