import { expect, it } from 'vitest';
import { createModeSchema } from './createModeSchema.js';
import { modeToCss } from './modeToCss.js';
import { derive } from './tracking.js';

const testSchema = createModeSchema({
	value: 'color',
	derived: {
		once: 'color',
		twice: 'color',
		again: 'color',
	},
});

const baseMode = testSchema.createBase({
	value: 'red',
	derived: {
		once: derive`color-mix(in hsl, ${testSchema.$tokens.value}, black)`,
		twice: derive`color-mix(in hsl, ${testSchema.$tokens.derived.once}, transparent)`,
		again: derive`color-mix(in hsl, ${testSchema.$tokens.value}, red)`,
	},
});

const partialMode = testSchema.createPartial('partial', {
	value: 'blue',
});

const underivedMode = testSchema.createPartial('underived', {
	derived: {
		once: 'green',
	},
});

it('prints a base mode with derived values', () => {
	const css = modeToCss(baseMode, baseMode);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-base,
		[data-mode-base=""],
		:where(.\\@mode-base [class^="\\@scheme-"]),
		:where([data-mode-base=""] [class^="\\@scheme-"]) {
			--ℹ️-mode: base;
			--Ⓜ️-derived-once: color-mix(in hsl, var(--Ⓜ️-value), black);
		--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-again: color-mix(in hsl, var(--Ⓜ️-value), red);
		--Ⓜ️-value: red;

		}
		"
	`);
});

it('prints a partial mode with derived dependencies it doesnt declare', () => {
	const css = modeToCss(partialMode, baseMode);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-partial,
		[data-mode-partial=""],
		:where(.\\@mode-partial [class^="\\@scheme-"]),
		:where([data-mode-partial=""] [class^="\\@scheme-"]) {
			--ℹ️-mode: partial;
			--Ⓜ️-derived-once: color-mix(in hsl, var(--Ⓜ️-value), black);
		--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-again: color-mix(in hsl, var(--Ⓜ️-value), red);
		--Ⓜ️-value: blue;

		}
		"
	`);
});

it('prints a partial mode which overrides derived dependencies from base and doesnt go upstream from there, but does go downstream to further derivations', () => {
	const css = modeToCss(underivedMode, baseMode);
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-underived,
		[data-mode-underived=""],
		:where(.\\@mode-underived [class^="\\@scheme-"]),
		:where([data-mode-underived=""] [class^="\\@scheme-"]) {
			--ℹ️-mode: underived;
			--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-once: green;

		}
		"
	`);
});

// $root tests
const rootSchema = createModeSchema({
	colors: {
		main: {
			$root: 'color',
			mid: 'color',
		},
	},
});

const rootBase = rootSchema.createBase({
	colors: {
		main: {
			$root: 'oklch(0.5 0.1 240)',
			mid: 'oklch(0.6 0.1 240)',
		},
	},
});

it('$root at nested level generates CSS var at group path (no -$root suffix)', () => {
	const css = modeToCss(rootBase, rootBase);
	expect(css).toContain('--Ⓜ️-colors-main: oklch(0.5 0.1 240)');
	expect(css).not.toContain('--Ⓜ️-colors-main-$root');
});

it('$root and sibling keys coexist and both emit correctly', () => {
	const css = modeToCss(rootBase, rootBase);
	expect(css).toContain('--Ⓜ️-colors-main: oklch(0.5 0.1 240)');
	expect(css).toContain('--Ⓜ️-colors-main-mid: oklch(0.6 0.1 240)');
});

it('partial mode override of $root maps correctly', () => {
	const partial = rootSchema.createPartial('alt', {
		colors: {
			main: {
				$root: 'oklch(0.7 0.2 30)',
			},
		},
	});
	const css = modeToCss(partial, rootBase);
	expect(css).toContain('--Ⓜ️-colors-main: oklch(0.7 0.2 30)');
	expect(css).not.toContain('--Ⓜ️-colors-main-mid');
});

it('throws with full token chain for circular derived dependencies', () => {
	const circularSchema = createModeSchema({
		value: 'color',
		derived: {
			a: 'color',
			b: 'color',
		},
	});

	const circularBase = circularSchema.createBase({
		value: 'red',
		derived: {
			a: derive`color-mix(in hsl, ${circularSchema.$tokens.derived.b}, white)`,
			b: derive`color-mix(in hsl, ${circularSchema.$tokens.derived.a}, black)`,
		},
	});

	expect(() => modeToCss(circularBase, circularBase)).toThrowError(
		/Circular dependency detected in mode base: .*--Ⓜ️-derived-a.*->.*--Ⓜ️-derived-b.*->.*--Ⓜ️-derived-a/,
	);
});
