import { definePreset, getInternals } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { modeToCss } from '../../rendering/modeToCss.js';
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
		mixins: (create, $) => ({
			disabled: create('disabled', {
				definition: (css) => css`
					${base.mixins.bgFaded.apply({ '--opacity': '0.5' })}
				`,
			}),
			hover: create('hover', {
				definition: (css) => css`
					&:hover {
						${base.mixins.bgLighter.apply({ '--step': 1 })}
						${base.$.mixins.ring.value}: ${base.functions.ring.compute({
							'--size': '2px',
							'--color': base.$.mode.color.main.heavy,
						})};
						cursor: pointer;
					}
				`,
			}),
		}),
		functions: (create, $) => ({
			test: create('test', {
				parameters: [],
				definition: (css) => css`red`,
			}),
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

	const hoverBodyText = preset.mixins.hover.body.text;
	expect(hoverBodyText).toMatchInlineSnapshot(
		`"&:hover { --_-param-bg-lighter-step: 1;--_-param-bg-lighter-source: var(--mx-bg-applied); --mx-bg-ref: oklch(from var(--_-param-bg-lighter-source, var(--mx-bg-applied)) calc(l + var(--_-param-bg-lighter-step) * 0.5 * (var(--m-global-whenLight, 1) * calc(pow(1 - l, 0.5)) * 2 + var(--m-global-whenDark, 1) * -0.08)) calc(c * calc(1 + var(--_-param-bg-lighter-step) * 0.5 * (var(--m-global-whenLight, 1) * -0.08) + (var(--m-global-whenDark, 1) * -0.02))) h); --mx-ring-value: 0 0 0 0px var(--m-global-trueLightColor), 0 0 0 calc(2px + 0px) var(--m-color-main-heavy); cursor: pointer; }"`,
	);

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

	const css = modeToCss(darkMode, preset, {});
	expect(css).toContain('.\\@mode-dark');
	expect(css).toContain('--m-action-primary-bg: var(--m-color-main-heavy);');
	// still includes built-in stuff
	expect(css).toContain('color-scheme: dark;');
});
