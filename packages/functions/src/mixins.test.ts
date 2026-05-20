import { printEquation } from '@arbor-css/calc';
import { describe, expect, it } from 'vitest';
import { createMixinFactory, isMixin } from './mixins.js';

const createMixin = createMixinFactory({ tokenPrefix: '--x-' });

describe('createMixin', () => {
	it('sets the CSS name with -- prefix', () => {
		const mixin = createMixin('shadow', {
			definition: () => [],
		});

		expect(mixin.name).toBe('--x-mixin-shadow');
	});

	it('stores description and declarations', () => {
		const mixin = createMixin('shadow', {
			description: 'Applies stacked shadow variables',
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: 'box-shadow',
					value: css`var(--x-system-ring), var(--x-system-shadow)`,
				},
			],
		});

		expect(mixin.description).toBe('Applies stacked shadow variables');
		expect(mixin.declarations).toHaveLength(2);
	});

	it('generates a CSS @mixin definition', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: '--x-system-ring',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: 'box-shadow',
					value: css`var(--x-system-ring), var(--x-system-shadow)`,
				},
			],
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 transparent; box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});

	it('supports object definitions', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => ({
				'--x-system-shadow': css`0 0 0 0 transparent`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		expect(mixin.declarations.map((decl) => decl.prop)).toEqual([
			'--x-system-shadow',
			'box-shadow',
		]);
	});

	it('returns inlinable declarations', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`
						${'0 0 0 0 transparent'}
					`,
				},
			],
		});

		expect(
			mixin.inline().map((decl) => ({
				prop: decl.prop,
				value: printEquation(decl.value),
			})),
		).toEqual([{ prop: '--x-system-shadow', value: '0 0 0 0 transparent' }]);
	});

	it('supports parameters in definitions', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'] as const,
			definition: (css, defaultRingColor) => ({
				'--x-system-shadow': css` 0 0 0 0 transparent`,
				'--x-system-ring': css`0 0 0 0 ${defaultRingColor}`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow(--default-ring-color) { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 var(--default-ring-color); box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});
});

describe('isMixin', () => {
	it('returns true for a created mixin', () => {
		const mixin = createMixin('shadow', {
			definition: () => [],
		});

		expect(isMixin(mixin)).toBe(true);
	});

	it('returns false for non-mixin values', () => {
		expect(isMixin(null)).toBe(false);
		expect(isMixin(undefined)).toBe(false);
		expect(isMixin(42)).toBe(false);
		expect(isMixin({ name: '--test' })).toBe(false);
	});
});
