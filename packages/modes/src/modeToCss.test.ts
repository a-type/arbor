import { css } from '@arbor-css/calc';
import { createGlobalContext } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { createModeSchema } from './createModeSchema.js';
import { modeToCss } from './modeToCss.js';

const ctx = createGlobalContext();
const systemProps = ctx.$systemTokens;

const testSchema = createModeSchema(
	{
		value: 'color',
		derived: {
			once: 'color',
			twice: 'color',
			again: 'color',
		},
	},
	{
		createToken: ctx.createToken,
	},
);

const baseMode = testSchema.createBase({
	value: 'red',
	derived: {
		once: css`color-mix(in hsl, ${testSchema.$tokens.value}, black)`,
		twice: css`color-mix(in hsl, ${testSchema.$tokens.derived.once}, transparent)`,
		again: css`color-mix(in hsl, ${testSchema.$tokens.value}, red)`,
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
	const css = modeToCss(baseMode, baseMode, { systemProps });
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-base,
		[data-mode-base=""],
		:where(.\\@mode-base [class^="\\@scheme-"]),
		:where([data-mode-base=""] [class^="\\@scheme-"]) {
			--x-system-mode: base;
			--x-derived-once: color-mix(in hsl, var(--x-value), black);
		--x-derived-twice: color-mix(in hsl, var(--x-derived-once), transparent);
		--x-derived-again: color-mix(in hsl, var(--x-value), red);
		--x-value: red;

		}
		"
	`);
});

it('prints a partial mode with derived dependencies it doesnt declare', () => {
	const css = modeToCss(partialMode, baseMode, { systemProps });
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-partial,
		[data-mode-partial=""],
		:where(.\\@mode-partial [class^="\\@scheme-"]),
		:where([data-mode-partial=""] [class^="\\@scheme-"]) {
			--x-system-mode: partial;
			--x-derived-once: color-mix(in hsl, var(--x-value), black);
		--x-derived-twice: color-mix(in hsl, var(--x-derived-once), transparent);
		--x-derived-again: color-mix(in hsl, var(--x-value), red);
		--x-value: blue;

		}
		"
	`);
});

it('prints a partial mode which overrides derived dependencies from base and doesnt go upstream from there, but does go downstream to further derivations', () => {
	const css = modeToCss(underivedMode, baseMode, { systemProps });
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-underived,
		[data-mode-underived=""],
		:where(.\\@mode-underived [class^="\\@scheme-"]),
		:where([data-mode-underived=""] [class^="\\@scheme-"]) {
			--x-system-mode: underived;
			--x-derived-twice: color-mix(in hsl, var(--x-derived-once), transparent);
		--x-derived-once: green;

		}
		"
	`);
});

// $root tests
const rootSchema = createModeSchema(
	{
		colors: {
			main: {
				$root: 'color',
				mid: 'color',
			},
		},
	},
	{
		createToken: ctx.createToken,
	},
);

const rootBase = rootSchema.createBase({
	colors: {
		main: {
			$root: 'oklch(0.5 0.1 240)',
			mid: 'oklch(0.6 0.1 240)',
		},
	},
});

it('$root at nested level generates CSS var at group path (no -$root suffix)', () => {
	const css = modeToCss(rootBase, rootBase, { systemProps });
	expect(css).toContain('--x-colors-main: oklch(0.5 0.1 240)');
	expect(css).not.toContain('--x-colors-main-$root');
});

it('$root and sibling keys coexist and both emit correctly', () => {
	const css = modeToCss(rootBase, rootBase, { systemProps });
	expect(css).toContain('--x-colors-main: oklch(0.5 0.1 240)');
	expect(css).toContain('--x-colors-main-mid: oklch(0.6 0.1 240)');
});

it('partial mode override of $root maps correctly', () => {
	const partial = rootSchema.createPartial('alt', {
		colors: {
			main: {
				$root: 'oklch(0.7 0.2 30)',
			},
		},
	});
	const css = modeToCss(partial, rootBase, { systemProps });
	expect(css).toContain('--x-colors-main: oklch(0.7 0.2 30)');
	expect(css).not.toContain('--x-colors-main-mid');
});

it('throws with full token chain for circular derived dependencies', () => {
	const circularSchema = createModeSchema(
		{
			value: 'color',
			derived: {
				a: 'color',
				b: 'color',
			},
		},
		{
			createToken: ctx.createToken,
		},
	);

	const circularBase = circularSchema.createBase({
		value: 'red',
		derived: {
			a: css`color-mix(in hsl, ${circularSchema.$tokens.derived.b}, white)`,
			b: css`color-mix(in hsl, ${circularSchema.$tokens.derived.a}, black)`,
		},
	});

	expect(() => modeToCss(circularBase, circularBase, { systemProps })).toThrow(
		/Circular dependency detected in mode base: .*--x-derived-a.*->.*--x-derived-b.*->.*--x-derived-a/,
	);
});
