import { modeToCss } from '@arbor-css/core';
import { describe, expect, it } from 'vitest';
import { testArbor, testBaseMode } from './_test.js';

type WithRoot<T extends object> = T & { $root: unknown };

describe('preset $root mappings', () => {
	it('maps mode color $root to mid by default', () => {
		const brand = testArbor.primitives.$tokens.colors.brand as WithRoot<
			typeof testArbor.primitives.$tokens.colors.brand
		>;
		const neutral = brand.$neutral as WithRoot<typeof brand.$neutral>;
		expect(brand.$root).toBe(
			testArbor.primitives.$tokens.colors.brand.mid,
		);
		expect(neutral.$root).toBe(
			testArbor.primitives.$tokens.colors.brand.$neutral.mid,
		);
		expect(testBaseMode.values.colors.main.$root).toBe(
			brand.$root,
		);
		expect(testBaseMode.values.colors.neutral.$root).toBe(
			neutral.$root,
		);
	});

	it('maps default scale values to mode $root tokens', () => {
		expect(
			(testArbor.primitives.$tokens.spacing as WithRoot<
				typeof testArbor.primitives.$tokens.spacing
			>).$root,
		).toBe(
			testArbor.primitives.$tokens.spacing[testArbor.primitives.spacing.defaultLevel],
		);
		expect(
			(testArbor.primitives.$tokens.typography as WithRoot<
				typeof testArbor.primitives.$tokens.typography
			>).$root,
		).toBe(
			testArbor.primitives.$tokens.typography[
				testArbor.primitives.typography.defaultLevel
			],
		);
		expect(
			(testArbor.primitives.$tokens.shadows as WithRoot<
				typeof testArbor.primitives.$tokens.shadows
			>).$root,
		).toBe(
			testArbor.primitives.$tokens.shadows[testArbor.primitives.shadows.defaultLevel],
		);

		const css = modeToCss(testBaseMode, testBaseMode);
		expect(css).toContain(
			'--Ⓜ️-spacing: calc(var(--s-spacing-md) / var(--Ⓜ️-density));',
		);
	});
});
