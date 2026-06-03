import { css } from '@arbor-css/calc';
import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { modeToCss } from './modeToCss.js';

const preset = definePreset({
	name: 'test-preset',
	modeSchema: {
		value: 'color',
		derived: {
			once: 'color',
			twice: 'color',
			again: 'color',
			direct: 'color',
		},
		ex: {
			$root: 'color',
			mid: 'color',
		},
	},
	baseMode: ($) => ({
		value: 'red',
		derived: {
			once: css`color-mix(in hsl, ${$.mode.value}, black)`,
			twice: css`color-mix(in hsl, ${$.mode.derived.once}, transparent)`,
			again: css`color-mix(in hsl, ${$.mode.value}, red)`,
			direct: $.mode.value,
		},
		ex: {
			$root: 'blue',
			mid: 'teal',
		},
	}),
});

const partialMode = preset.createMode('partial', {
	value: 'blue',
});

const underivedMode = preset.createMode('underived', {
	derived: {
		once: 'green',
	},
});

it('prints a base mode with derived values', () => {
	const css = modeToCss(preset.baseMode, preset);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-base, :root, .\\@mode-base, :root {
			--_-system-modeName: base;
			--m-derived-once: color-mix(in hsl, var(--m-value), black);
			--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
			--m-derived-again: color-mix(in hsl, var(--m-value), red);
			--m-derived-direct: var(--m-value);
			--m-value: red;
			--m-ex: blue;
			--m-ex-mid: teal;
			} "
	`);
});

it('prints a partial mode with derived dependencies it doesnt declare', () => {
	const css = modeToCss(partialMode, preset);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-partial {
			--_-system-modeName: partial;
			--m-derived-once: color-mix(in hsl, var(--m-value), black);
			--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
			--m-derived-again: color-mix(in hsl, var(--m-value), red);
			--m-derived-direct: var(--m-value);
			--m-value: blue;
			} "
	`);
});

it('prints a partial mode which overrides derived dependencies from base and doesnt go upstream from there, but does go downstream to further derivations', () => {
	const css = modeToCss(underivedMode, preset);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-underived {
			--_-system-modeName: underived;
			--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
			--m-derived-once: green;
			} "
	`);
});

const rootBase = preset.createMode('rootBase', {
	ex: {
		$root: 'oklch(0.5 0.1 240)',
		mid: 'oklch(0.6 0.1 240)',
	},
});

it('$root at nested level generates CSS var at group path (no -$root suffix)', () => {
	const css = modeToCss(rootBase, preset);
	expect(css).toContain('--m-ex: oklch(0.5 0.1 240)');
	expect(css).not.toContain('--m-ex-$root');
});

it('$root and sibling keys coexist and both emit correctly', () => {
	const css = modeToCss(rootBase, preset);
	expect(css).toContain('--m-ex: oklch(0.5 0.1 240)');
	expect(css).toContain('--m-ex-mid: oklch(0.6 0.1 240)');
});

it('partial mode override of $root maps correctly', () => {
	const partial = preset.createMode('partial', {
		ex: {
			$root: 'oklch(0.7 0.2 30)',
		},
	});
	const css = modeToCss(partial, preset);
	expect(css).toContain('--m-ex: oklch(0.7 0.2 30)');
	expect(css).not.toContain('--m-ex-mid');
});

it('throws with full token chain for circular derived dependencies', () => {
	const circular = definePreset({
		name: 'circularPreset',
		modeSchema: {
			value: 'color',
			derived: {
				a: 'color',
				b: 'color',
			},
		},
		baseMode: ($) => ({
			value: 'red',
			derived: {
				a: css`color-mix(in hsl, ${$.mode.derived.b}, white)`,
				b: css`color-mix(in hsl, ${$.mode.derived.a}, black)`,
			},
		}),
	});

	expect(() => modeToCss(circular.baseMode, circular)).toThrow(
		/Circular dependency detected .*--m-derived-a.*->.*--m-derived-b.*->.*--m-derived-a/,
	);
});
