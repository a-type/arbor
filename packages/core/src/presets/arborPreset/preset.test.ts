import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { presetArbor } from './preset.js';

it('is extensible', () => {
	const base = presetArbor({
		color: {
			ranges: {
				red: { hue: 0 },
			},
			mainColor: 'red',
		},
	});

	const preset = definePreset({
		name: 'test',
		extends: [base],
		modeSchema: {
			test: 'color',
		},
		baseMode: () => ({
			test: 'red',
			action: {
				roundness: 0.5,
			},
		}),
	});

	expect(preset.$.primitives.color.mainColor).toBe(
		base.$.primitives.color.mainColor,
	);
	expect(preset.baseMode.test).toBe('red');
	expect(preset.baseMode.action?.roundness).toBe(0.5);
});
