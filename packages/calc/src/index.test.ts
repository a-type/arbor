import { createToken } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { $, computeEquation, printEquation } from './index.js';

const tokenA = createToken('foo');
const tokenB = createToken('bar');

describe('calc printEquation', () => {
	it('should print a simple literal equation', () => {
		const result = printEquation($.val('10px'));
		expect(result).toBe('10px');
	});

	it('should print a simple addition equation', () => {
		const result = printEquation($.add($.val('10px'), $.val('5px')));
		expect(result).toBe('(10px + 5px)');
	});

	it('should print a token reference', () => {
		const result = printEquation($.token(tokenA));
		expect(result).toBe(tokenA.var);
	});

	it('should print a token with a fallback', () => {
		const result = printEquation($.token(tokenA, $.val('10px')));
		expect(result).toBe(`${tokenA.varFallback('10px')}`);
	});
});

describe('calc computeEquation', () => {
	it('should compute a simple literal equation', () => {
		const result = computeEquation($.val('10px'), { propertyValues: {} });
		expect(result).toEqual({ value: 10, type: 'numeric', unit: 'px' });
	});

	it('should compute a simple addition equation', () => {
		const result = computeEquation($.add($.val('10px'), $.val('5px')), {
			propertyValues: {},
		});
		expect(result).toEqual({ value: 15, type: 'numeric', unit: 'px' });
	});

	it('should compute a token reference', () => {
		const result = computeEquation($.token(tokenA), {
			propertyValues: { [tokenA.name]: '20px' },
		});
		expect(result).toEqual({ value: 20, type: 'numeric', unit: 'px' });
	});

	it('should compute a token with a fallback', () => {
		const result = computeEquation($.token(tokenA, $.val('10px')), {
			propertyValues: {},
		});
		expect(result).toEqual({ value: 'var(--foo, 10px)', type: 'calc' });
	});

	it('supports grouping with parentheses', () => {
		const equation = $.multiply(
			$.group($.add($.val('1%'), $.val('10%'))),
			$.val('5%'),
		);
		const result = computeEquation(equation, { propertyValues: {} });
		expect(result).toEqual({ value: 0.55, unit: '%', type: 'numeric' });
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
			$.multiply($.token(tokenB), $.val('2')),
		);
		expect(equation.tokens).toEqual([tokenA, tokenB]);
	});
});
