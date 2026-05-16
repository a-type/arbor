import { $, printEquation } from '@arbor-css/calc';
import { describe, expect, it } from 'vitest';
import { createFunction, isFunction } from './index.js';

describe('createFunction', () => {
	it('sets the CSS name with -- prefix', () => {
		const fn = createFunction('my-func', {
			parameters: [],
			definition: $.literal(0),
		});
		expect(fn.name).toBe('--my-func');
	});

	it('stores description and parameters', () => {
		const fn = createFunction('scale', {
			description: 'Scales a value',
			parameters: [
				{ name: 'base', type: 'length' },
				{ name: 'factor', type: 'number' },
			],
			definition: $.multiply(
				$.literal('var(--base)'),
				$.literal('var(--factor)'),
			),
		});
		expect(fn.description).toBe('Scales a value');
		expect(fn.parameters).toEqual([
			{ name: 'base', type: 'length' },
			{ name: 'factor', type: 'number' },
		]);
	});

	describe('definition (CSS @function)', () => {
		it('generates @function with typed parameters', () => {
			const fn = createFunction('scale', {
				parameters: [
					{ name: 'base', type: 'length' },
					{ name: 'factor', type: 'number' },
				],
				definition: $.multiply(
					$.literal('var(--base)'),
					$.literal('var(--factor)'),
				),
			});
			expect(fn.definition).toBe(
				'@function --scale(--base <length>, --factor <number>) { result: (var(--base) * var(--factor)); }',
			);
		});

		it('omits type annotation for * (wildcard) type', () => {
			const fn = createFunction('passthrough', {
				parameters: [{ name: 'value', type: '*' }],
				definition: $.literal('var(--value)'),
			});
			expect(fn.definition).toBe(
				'@function --passthrough(--value) { result: var(--value); }',
			);
		});

		it('omits type annotation when type is not provided (defaults to *)', () => {
			const fn = createFunction('passthrough', {
				parameters: [{ name: 'value' }],
				definition: $.literal('var(--value)'),
			});
			expect(fn.definition).toBe(
				'@function --passthrough(--value) { result: var(--value); }',
			);
		});

		it('generates @function with no parameters', () => {
			const fn = createFunction('pi', {
				parameters: [],
				definition: $.literal('PI'),
			});
			expect(fn.definition).toBe('@function --pi() { result: PI; }');
		});

		it('generates @function with clamp equation', () => {
			const fn = createFunction('clamped', {
				parameters: [
					{ name: 'value', type: 'number' },
					{ name: 'min', type: 'number' },
					{ name: 'max', type: 'number' },
				],
				definition: $.clamp(
					$.literal('var(--value)'),
					$.literal('var(--min)'),
					$.literal('var(--max)'),
				),
			});
			expect(fn.definition).toBe(
				'@function --clamped(--value <number>, --min <number>, --max <number>) { result: clamp(var(--min), var(--value), var(--max)); }',
			);
		});
	});

	describe('compute', () => {
		it('computes a simple multiply with numeric values', () => {
			const fn = createFunction('scale', {
				parameters: [
					{ name: 'base', type: 'number' },
					{ name: 'factor', type: 'number' },
				],
				definition: $.multiply(
					$.literal('var(--base)'),
					$.literal('var(--factor)'),
				),
			});
			expect(fn.compute({ base: 4, factor: 3 })).toBe('12');
		});

		it('computes an add expression', () => {
			const fn = createFunction('add', {
				parameters: [
					{ name: 'a', type: 'number' },
					{ name: 'b', type: 'number' },
				],
				definition: $.add($.literal('var(--a)'), $.literal('var(--b)')),
			});
			expect(fn.compute({ a: 10, b: 5 })).toBe('15');
		});

		it('computes with string values that cannot be resolved numerically', () => {
			const fn = createFunction('scale-length', {
				parameters: [
					{ name: 'base', type: 'length' },
					{ name: 'factor', type: 'number' },
				],
				definition: $.multiply(
					$.literal('var(--base)'),
					$.literal('var(--factor)'),
				),
			});
			// '8px' is not a plain number so calc falls through to a calc() string
			const result = fn.compute({ base: '8px', factor: 2 });
			expect(result).toMatch(/8px/);
			expect(result).toMatch(/2/);
		});

		it('resolves a constant equation with no params', () => {
			const fn = createFunction('answer', {
				parameters: [],
				definition: $.multiply($.literal(6), $.literal(7)),
			});
			expect(fn.compute({})).toBe('42');
		});
	});

	describe('equation property', () => {
		it('stores the original equation', () => {
			const eq = $.add($.literal(1), $.literal(2));
			const fn = createFunction('test', {
				parameters: [],
				definition: eq,
			});
			expect(fn.equation).toBe(eq);
		});

		it('equation can be printed independently', () => {
			const fn = createFunction('test', {
				parameters: [{ name: 'x' }],
				definition: $.multiply($.literal('var(--x)'), $.literal(2)),
			});
			expect(printEquation(fn.equation)).toBe('(var(--x) * 2)');
		});
	});
});

describe('isFunction', () => {
	it('returns true for a created function', () => {
		const fn = createFunction('test', {
			parameters: [],
			definition: $.literal(0),
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
