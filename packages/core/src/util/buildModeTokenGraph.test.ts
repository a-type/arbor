import { css } from '@arbor-css/css-eval';
import { simplifier } from '@arbor-css/css-eval/node';
import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { presetArbor } from '../presets/arborPreset/preset.js';
import { buildModeTokenGraph } from './buildModeTokenGraph.js';

it('resolves token dependencies and sub-dependencies', () => {
	const preset = definePreset({
		name: 'test',
		modeSchema: {
			root: 'color',
			derived: {
				once: 'color',
				twice: 'color',
			},
			unrelated: 'color',
		},
		baseMode: ($) => ({
			root: 'red',
			derived: {
				once: css`color-mix(in hsl, ${$.mode.root}, black)`,
				twice: css`color-mix(in hsl, ${$.mode.derived.once}, transparent)`,
			},
			unrelated: 'blue',
		}),
	});

	const setRootMode = preset.createMode('set-root', {
		root: 'green',
	});

	const setUnrelatedMode = preset.createMode('set-unrelated', {
		unrelated: 'yellow',
	});

	const graphFromSetRoot = buildModeTokenGraph(setRootMode, preset, {
		simplifier,
	});

	expect(graphFromSetRoot.roots).toEqual(['--m-root']);
	expect(graphFromSetRoot.nodes['--m-root'].dependents).toEqual([
		'--m-derived-once',
	]);
	expect(graphFromSetRoot.nodes['--m-derived-once'].dependents).toEqual([
		'--m-derived-twice',
	]);
	expect(graphFromSetRoot.nodes['--m-unrelated']).toBeDefined();

	const graphFromSetUnrelated = buildModeTokenGraph(setUnrelatedMode, preset, {
		simplifier,
		skipBaking: false,
	});

	expect(graphFromSetUnrelated.roots).toEqual(['--m-unrelated']);
	expect(graphFromSetUnrelated.nodes['--m-unrelated'].dependents).toEqual([]);
	expect(graphFromSetUnrelated.nodes['--m-root']).toBeDefined();
});

// real-world regression test with arbor preset
it('resolves and computes complicated dependency chains', () => {
	const preset = presetArbor({
		color: {
			mainColor: 'brand',
			ranges: {
				brand: { hue: 0 },
			},
		},
	});

	const mode = preset.createMode('test', {
		global: { spacing: { density: 2 } },
	});

	const graphWithDensity = buildModeTokenGraph(mode, preset, {
		skipBaking: false,
		simplifier,
	});

	expect(
		graphWithDensity.nodes['--m-primitive-spacing-md'].computed,
	).toMatchInlineSnapshot(`"8px"`);
});
