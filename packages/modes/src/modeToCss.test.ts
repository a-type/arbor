import { css } from '@arbor-css/calc';
import { createGlobalContext } from '@arbor-css/globals';
import { convertSimpleTokenSchema } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import {
	createModeInstance,
	createModeSchema,
	createPartialModeInstance,
} from './createModeSchema.js';
import { modeToCss } from './modeToCss.js';

const ctx = createGlobalContext();
const systemProps = ctx.$systemTokens;

const testSchema = createModeSchema({
	value: 'color',
	derived: {
		once: 'color',
		twice: 'color',
		again: 'color',
	},
});

const $mode = convertSimpleTokenSchema(testSchema, '', ctx.createModeToken);

const baseMode = createModeInstance(
	testSchema,
	{
		value: 'red',
		derived: {
			once: css`color-mix(in hsl, ${$mode.value}, black)`,
			twice: css`color-mix(in hsl, ${$mode.derived.once}, transparent)`,
			again: css`color-mix(in hsl, ${$mode.value}, red)`,
		},
	},
	{
		name: 'base',
	},
);

const partialMode = createPartialModeInstance(
	testSchema,
	{
		value: 'blue',
	},
	{
		name: 'partial',
	},
);

const underivedMode = createPartialModeInstance(
	testSchema,
	{
		derived: {
			once: 'green',
		},
	},
	{
		name: 'underived',
	},
);

it('prints a base mode with derived values', () => {
	const css = modeToCss(baseMode, baseMode, { systemProps, modeTokens: $mode });
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-base,
		[data-mode-base=""],
		:where(.\\@mode-base [class^="\\@scheme-"]),
		:where([data-mode-base=""] [class^="\\@scheme-"]) {
			--_-system-modeName: base;
			--m-derived-once: color-mix(in hsl, var(--m-value), black);
		--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
		--m-derived-again: color-mix(in hsl, var(--m-value), red);
		--m-value: red;

		}
		"
	`);
});

it('prints a partial mode with derived dependencies it doesnt declare', () => {
	const css = modeToCss(partialMode, baseMode, {
		systemProps,
		modeTokens: $mode,
	});
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-partial,
		[data-mode-partial=""],
		:where(.\\@mode-partial [class^="\\@scheme-"]),
		:where([data-mode-partial=""] [class^="\\@scheme-"]) {
			--_-system-modeName: partial;
			--m-derived-once: color-mix(in hsl, var(--m-value), black);
		--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
		--m-derived-again: color-mix(in hsl, var(--m-value), red);
		--m-value: blue;

		}
		"
	`);
});

it('prints a partial mode which overrides derived dependencies from base and doesnt go upstream from there, but does go downstream to further derivations', () => {
	const css = modeToCss(underivedMode, baseMode, {
		systemProps,
		modeTokens: $mode,
	});
	expect(css).toMatchInlineSnapshot(`
		".\\@mode-underived,
		[data-mode-underived=""],
		:where(.\\@mode-underived [class^="\\@scheme-"]),
		:where([data-mode-underived=""] [class^="\\@scheme-"]) {
			--_-system-modeName: underived;
			--m-derived-twice: color-mix(in hsl, var(--m-derived-once), transparent);
		--m-derived-once: green;

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

const $rootMode = convertSimpleTokenSchema(rootSchema, '', ctx.createModeToken);

const rootBase = createModeInstance(
	rootSchema,
	{
		colors: {
			main: {
				$root: 'oklch(0.5 0.1 240)',
				mid: 'oklch(0.6 0.1 240)',
			},
		},
	},
	{
		name: 'rootBase',
	},
);

it('$root at nested level generates CSS var at group path (no -$root suffix)', () => {
	const css = modeToCss(rootBase, rootBase, {
		systemProps,
		modeTokens: $rootMode,
	});
	expect(css).toContain('--m-colors-main: oklch(0.5 0.1 240)');
	expect(css).not.toContain('--m-colors-main-$root');
});

it('$root and sibling keys coexist and both emit correctly', () => {
	const css = modeToCss(rootBase, rootBase, {
		systemProps,
		modeTokens: $rootMode,
	});
	expect(css).toContain('--m-colors-main: oklch(0.5 0.1 240)');
	expect(css).toContain('--m-colors-main-mid: oklch(0.6 0.1 240)');
});

it('partial mode override of $root maps correctly', () => {
	const partial = createPartialModeInstance(
		rootSchema,
		{
			colors: {
				main: {
					$root: 'oklch(0.7 0.2 30)',
				},
			},
		},
		{
			name: 'partial',
		},
	);
	const css = modeToCss(partial, rootBase, {
		systemProps,
		modeTokens: $rootMode,
	});
	expect(css).toContain('--m-colors-main: oklch(0.7 0.2 30)');
	expect(css).not.toContain('--m-colors-main-mid');
});

it('throws with full token chain for circular derived dependencies', () => {
	const circularSchema = createModeSchema({
		value: 'color',
		derived: {
			a: 'color',
			b: 'color',
		},
	});

	const $circularMode = convertSimpleTokenSchema(
		circularSchema,
		'',
		ctx.createModeToken,
	);

	const circularBase = createModeInstance(
		circularSchema,
		{
			value: 'red',
			derived: {
				a: css`color-mix(in hsl, ${$circularMode.derived.b}, white)`,
				b: css`color-mix(in hsl, ${$circularMode.derived.a}, black)`,
			},
		},
		{
			name: 'circularBase',
		},
	);

	expect(() =>
		modeToCss(circularBase, circularBase, {
			systemProps,
			modeTokens: $circularMode,
		}),
	).toThrow(
		/Circular dependency detected in mode circularBase: .*--m-derived-a.*->.*--m-derived-b.*->.*--m-derived-a/,
	);
});
