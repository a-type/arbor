import { definePreset, getInternals } from '@arbor-css/preset';
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

	// typecheck arbor preset
	base.$.mixins.bgFaded;
	// @ts-expect-error
	base.$.mixins.askdjfs;
	base.mixins.bgFaded;
	// @ts-expect-error
	base.mixins.askdjfs;

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

	// preserves modes from base
	expect(getInternals(preset).modes.dark).toBeDefined();
	expect(getInternals(preset).modes.light).toBeDefined();
	expect(getInternals(preset).modes.inverted).toBeDefined();

	// check typing of extended mixins
	// @ts-expect-error
	preset.$.mixins.adfa;
	preset.mixins.bgFaded;
	// @ts-expect-error
	preset.mixins.askdjfs;
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
	expect(css).toContain('.\\@mode-dark');
	expect(css).toContain('--m-action-primary-bg: var(--m-color-main-heavy);');
	// still includes built-in stuff
	expect(css).toContain('color-scheme: dark;');
});
