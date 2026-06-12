import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import {
	$,
	computeEquation,
	extractLiteralFromSimpleCalc,
	printEquation,
} from './calcTree.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

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
			propertyValues: {
				[tokenA.name]: '20px',
			},
		});
		expect(result).toEqual({
			value: 20,
			type: 'numeric',
			unit: 'px',
		});
	});

	it('should compute a concatenated token with fallback', () => {
		const shadowResult = computeEquation(
			$.token(tokenA, $.concat([$.val(0), $.val(0), $.val(0), $.val('black')])),
			{
				propertyValues: {
					[tokenA.name]: '0 0 5px red',
				},
			},
		);
		expect(shadowResult).toEqual({
			value: '0 0 5px red',
			type: 'calc',
		});
	});

	it('supports grouping with parentheses', () => {
		const equation = $.multiply(
			$.group($.add($.val('1%'), $.val('10%'))),
			$.val('5%'),
		);
		const result = computeEquation(equation, { propertyValues: {} });
		expect(result).toEqual({ value: 0.55, unit: '%', type: 'numeric' });
	});

	it('supports multiplying against scalars', () => {
		const equation = $.multiply($.val('5'), $.val('10px'));
		const result = computeEquation(equation, { propertyValues: {} });
		expect(result).toEqual({ value: 50, unit: 'px', type: 'numeric' });
	});

	it('resolves property values defined as equations', () => {
		const result = computeEquation($.val(`var(${tokenA.name})`), {
			propertyValues: {
				[tokenA.name]: $.add($.val('10px'), $.val('5px')),
			},
		});
		expect(result).toEqual({ value: 15, type: 'numeric', unit: 'px' });
	});

	it('avoids infinite recursion for cyclic equation property values', () => {
		const result = computeEquation($.val(`var(${tokenA.name})`), {
			propertyValues: {
				[tokenA.name]: $.val(`var(${tokenB.name})`),
				[tokenB.name]: $.val(`var(${tokenA.name})`),
			},
		});
		expect(result).toEqual({
			value: `var(${tokenA.name})`,
			type: 'calc',
		});
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

describe('extractLiteralFromSimpleCalc', () => {
	it('should extract the literal value from a simple calc expression', () => {
		expect(extractLiteralFromSimpleCalc('calc(10px)')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(  5em  )')).toBe('5em');
		expect(extractLiteralFromSimpleCalc('calc(-3.5%)')).toBe('-3.5%');
		expect(extractLiteralFromSimpleCalc('calc((10px))')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(l)')).toBe('l');
	});

	it('should return the original value if it is not a simple calc expression', () => {
		expect(extractLiteralFromSimpleCalc('10px')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(10px + 5px)')).toBe(
			'calc(10px + 5px)',
		);
		expect(extractLiteralFromSimpleCalc('calc(var(--x) + 5px)')).toBe(
			'calc(var(--x) + 5px)',
		);
	});
});
