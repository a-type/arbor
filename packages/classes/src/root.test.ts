import { modeToCss } from '@arbor-css/core';
import { describe, expect, it } from 'vitest';
import { testArbor, testBaseMode } from './_test.js';

describe('preset $root mappings', () => {
	it('maps mode color $root to mid by default', () => {
		const brand = testArbor.primitives.$tokens.colors.brand as any;
		const neutral = brand.$neutral as any;
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
		expect((testArbor.primitives.$tokens.spacing as any).$root).toBe(
			testArbor.primitives.$tokens.spacing[testArbor.primitives.spacing.defaultLevel],
		);
		expect((testArbor.primitives.$tokens.typography as any).$root).toBe(
			testArbor.primitives.$tokens.typography[
				testArbor.primitives.typography.defaultLevel
			],
		);
		expect((testArbor.primitives.$tokens.shadows as any).$root).toBe(
			testArbor.primitives.$tokens.shadows[testArbor.primitives.shadows.defaultLevel],
		);

		const css = modeToCss(testBaseMode, testBaseMode);
		expect(css).toContain(
			'--Ⓜ️-spacing: calc(var(--s-spacing-md) / var(--Ⓜ️-density));',
		);
	});
});
