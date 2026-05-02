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
		"--Ⓜ️-derived-once: color-mix(in hsl, var(--Ⓜ️-value), black);
		--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-again: color-mix(in hsl, var(--Ⓜ️-value), red);
		--Ⓜ️-value: red;
		"
	`);
});

it('prints a partial mode with derived dependencies it doesnt declare', () => {
	const css = modeToCss(partialMode, baseMode);
	expect(css).toMatchInlineSnapshot(`
		"--Ⓜ️-derived-once: color-mix(in hsl, var(--Ⓜ️-value), black);
		--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-again: color-mix(in hsl, var(--Ⓜ️-value), red);
		--Ⓜ️-value: blue;
		"
	`);
});

it('prints a partial mode which overrides derived dependencies from base and doesnt go upstream from there, but does go downstream to further derivations', () => {
	const css = modeToCss(underivedMode, baseMode);
	expect(css).toMatchInlineSnapshot(`
		"--Ⓜ️-derived-twice: color-mix(in hsl, var(--Ⓜ️-derived-once), transparent);
		--Ⓜ️-derived-once: green;
		"
	`);
});
