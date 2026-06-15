import { printEquation } from '@arbor-css/calc';
import { describe, expect, it } from 'vitest';
import { createFunctionFactory, isFunction } from './functions.js';

const createFunction = createFunctionFactory({ namePrefix: '--x-fn-' });

describe('createFunction', () => {
	it('sets the CSS name with -- prefix', () => {
		const fn = createFunction('my-func', {
			parameters: [],
			definition: ($) => $`0`,
		});
		expect(fn.name).toBe('--x-fn-my-func');
	});

	it('stores description and parameters', () => {
		const fn = createFunction('scale', {
			description: 'Scales a value',
			parameters: ['--base', '--factor'],
			definition: ($, base, factor) => $`calc(${base} * ${factor})`,
		});
		expect(fn.description).toBe('Scales a value');
		expect(fn.parameters).toHaveLength(2);
	});

	describe('definition (CSS @function)', () => {
		it('generates @function with typed parameters', () => {
			const fn = createFunction('scale', {
				parameters: ['--base', '--factor'],
				definition: ($, base, factor) => $`calc(${base} * ${factor})`,
			});
			expect(fn.definition).toBe(
				'@function --x-fn-scale(--_-param-scale-base, --_-param-scale-factor) { result: calc(var(--_-param-scale-base) * var(--_-param-scale-factor)); }',
			);
		});

		it('omits type annotation for * (wildcard) type', () => {
			const fn = createFunction('passthrough', {
				parameters: ['--value'],
				definition: ($, value) => $`${value}`,
			});
			expect(fn.definition).toBe(
				'@function --x-fn-passthrough(--_-param-passthrough-value) { result: var(--_-param-passthrough-value); }',
			);
		});

		it('omits type annotation when type is not provided (defaults to *)', () => {
			const fn = createFunction('passthrough', {
				parameters: ['--value'],
				definition: ($, value) => $`${value}`,
			});
			expect(fn.definition).toBe(
				'@function --x-fn-passthrough(--_-param-passthrough-value) { result: var(--_-param-passthrough-value); }',
			);
		});

		it('generates @function with no parameters', () => {
			const fn = createFunction('pi', {
				parameters: [],
				definition: ($) => $`PI`,
			});
			expect(fn.definition).toBe('@function --x-fn-pi() { result: PI; }');
		});

		it('generates @function with clamp equation', () => {
			const fn = createFunction('clamped', {
				parameters: ['--value', '--min', '--max'],
				definition: ($, value, min, max) => $`clamp(${min}, ${value}, ${max})`,
			});
			expect(fn.definition).toBe(
				'@function --x-fn-clamped(--_-param-clamped-value, --_-param-clamped-min, --_-param-clamped-max) { result: clamp(var(--_-param-clamped-min), var(--_-param-clamped-value), var(--_-param-clamped-max)); }',
			);
		});
	});

	describe('compute', () => {
		it('computes a simple multiply with numeric values', () => {
			const fn = createFunction('scale', {
				parameters: ['--base', '--factor'],
				definition: ($, base, factor) => $`calc(${base} * ${factor})`,
			});
			expect(fn.compute({ '--base': 4, '--factor': 3 })).toBe('12');
		});

		it('computes an add expression', () => {
			const fn = createFunction('add', {
				parameters: ['--a', '--b'],
				definition: ($, a, b) => $`calc(${a} + ${b})`,
			});
			expect(fn.compute({ '--a': 10, '--b': 5 })).toBe('15');
		});

		it('computes with string values that cannot be resolved numerically', () => {
			const fn = createFunction('scale-length', {
				parameters: ['--base', '--factor'],
				definition: ($, base, factor) => $`calc(${base} * ${factor})`,
			});
			const result = fn.compute({ '--base': '8px', '--factor': 2 });
			expect(result).toBe('16px');
		});

		it('resolves a constant equation with no params', () => {
			const fn = createFunction('answer', {
				parameters: [],
				definition: ($) => $`6 * 7`,
			});
			expect(fn.compute({})).toBe('42');
		});

		it('does not require specifying params with defaults', () => {
			const fn = createFunction('test', {
				parameters: [
					'--required',
					{ name: '--optional', fallback: '10' },
				] as const,
				definition: ($, required, optional) =>
					$`calc(${required} + ${optional})`,
			});
			expect(fn.compute({ '--required': 5 })).toBe('15');
			expect(fn.compute({ '--required': 5, '--optional': 20 })).toBe('25');
		});
	});

	describe('equation property', () => {
		it('equation can be printed independently', () => {
			const fn = createFunction('test', {
				parameters: ['--x'],
				definition: ($, x) => $`calc(${x} * 2)`,
			});
			expect(printEquation(fn.equation)).toBe(
				'calc(var(--_-param-test-x) * 2)',
			);
		});
	});
});

describe('isFunction', () => {
	it('returns true for a created function', () => {
		const fn = createFunction('test', {
			parameters: [],
			definition: ($) => $`0`,
		});
		expect(isFunction(fn)).toBe(true);
	});

	it('returns false for non-function values', () => {
		expect(isFunction(null)).toBe(false);
		expect(isFunction(undefined)).toBe(false);
		expect(isFunction(42)).toBe(false);
		expect(isFunction({ name: '--test' })).toBe(false);
	});
});
