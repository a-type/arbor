import { createToken } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { $, computeEquation, printEquation } from './index.js';

const tokenA = createToken('foo');
const tokenB = createToken('bar');

describe('calc printEquation', () => {
	it('should print a simple literal equation', () => {
		const result = printEquation($.literal('10px'));
		expect(result).toBe('10px');
	});

	it('should print a simple addition equation', () => {
		const result = printEquation($.add($.literal('10px'), $.literal('5px')));
		expect(result).toBe('(10px + 5px)');
	});

	it('should print a token reference', () => {
		const result = printEquation($.token(tokenA));
		expect(result).toBe(tokenA.var);
	});

	it('should print a token with a fallback', () => {
		const result = printEquation($.token(tokenA, $.literal('10px')));
		expect(result).toBe(`${tokenA.varFallback('10px')}`);
	});
});

describe('calc computeEquation', () => {
	it('should compute a simple literal equation', () => {
		const result = computeEquation($.literal('10px'), { propertyValues: {} });
		expect(result).toEqual({ value: '10px', type: 'calc' });
	});

	it('should compute a simple addition equation', () => {
		const result = computeEquation($.add($.literal('10px'), $.literal('5px')), {
			propertyValues: {},
		});
		expect(result).toEqual({ value: '15px', type: 'calc' });
	});

	it('should compute a token reference', () => {
		const result = computeEquation($.token(tokenA), {
			propertyValues: { [tokenA.name]: '20px' },
		});
		expect(result).toEqual({ value: '20px', type: 'calc' });
	});

	it('should compute a token with a fallback', () => {
		const result = computeEquation($.token(tokenA, $.literal('10px')), {
			propertyValues: {},
		});
		expect(result).toEqual({ value: 'var(--foo, 10px)', type: 'calc' });
	});
});

describe('token tracking', () => {
	it('should track tokens used in an equation', () => {
		const equation = $.add($.token(tokenA), $.token(tokenB));
		expect(equation.tokens).toEqual([tokenA, tokenB]);
	});

	it('should track tokens used in nested equations', () => {
		const equation = $.add(
			$.token(tokenA),
			$.multiply($.token(tokenB), $.literal('2')),
		);
		expect(equation.tokens).toEqual([tokenA, tokenB]);
	});
});
