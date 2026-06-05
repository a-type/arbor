import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { modeToCss } from '../../stylesheet/modeToCss.js';
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

	expect(preset.$.mode.primitive.color.red.mid.name).toEqual(
		base.$.mode.primitive.color.red.mid.name,
	);
	expect(preset.baseMode.test).toBe('red');
	expect(preset.baseMode.action?.roundness).toBe(0.5);

	// check typing of mixin tokens
	// @ts-expect-error
	preset.$.mixins.adfa;
});

it('allows augmenting built-in modes', () => {
	const preset = presetArbor({
		color: {
			ranges: {
				red: { hue: 0 },
			},
			mainColor: 'red',
		},
	});

	const darkMode = preset.bundleMode('dark', {
		action: {
			primary: {
				bg: preset.$.mode.color.main.heavy,
				fg: preset.$.mode.color.main.paper,
			},
		},
	});

	const css = modeToCss(darkMode, preset);
	expect(css).toContain('--m-action-primary-bg: var(--m-color-main-heavy);');
	// still includes built-in stuff
	expect(css).toContain('color-scheme: dark;');
});
