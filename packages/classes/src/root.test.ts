import { modeToCss } from '@arbor-css/core';
import { describe, expect, it } from 'vitest';
import { testArbor, testBaseMode } from './_test.js';

describe('preset $root mappings', () => {
	it('maps mode color $root to mid by default', () => {
		expect(testArbor.primitives.colors.light.colors.brand.$root).toBe(
			testArbor.primitives.colors.light.colors.brand.mid,
		);
		expect(testArbor.primitives.colors.light.colors.brand.$neutral.$root).toBe(
			testArbor.primitives.colors.light.colors.brand.$neutral.mid,
		);
		expect(testBaseMode.values.color.main.$root).toBe(
			testArbor.primitives.$tokens.colors.brand.$root,
		);
		expect(testBaseMode.values.color.neutral.$root).toBe(
			testArbor.primitives.$tokens.colors.brand.$neutral.$root,
		);
	});

	it('maps default scale values to mode $root tokens', () => {
		expect(testArbor.primitives.spacing.levels.$root).toBe(
			testArbor.primitives.spacing.levels[
				testArbor.primitives.spacing.defaultLevel
			],
		);
		expect(testArbor.primitives.typography.levels.$root).toEqual(
			testArbor.primitives.typography.levels[
				testArbor.primitives.typography.defaultLevel
			],
		);
		expect(testArbor.primitives.shadows.levels.$root).toEqual(
			testArbor.primitives.shadows.levels[
				testArbor.primitives.shadows.defaultLevel
			],
		);

		const css = modeToCss(testBaseMode, testBaseMode);
		expect(css).toContain(
			`--Ⓜ️-spacing: calc(${testArbor.primitives.$tokens.spacing.$root.var} / var(--Ⓜ️-density));`,
		);
	});
});
