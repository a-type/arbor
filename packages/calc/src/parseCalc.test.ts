import { createToken } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { $, computeEquation, Equation, printEquation } from './index.js';
import { calc } from './parseCalc.js';

const tokenA = createToken('foo');
const tokenB = createToken('bar');

// ─── Equivalence helpers ─────────────────────────────────────────────────────

/**
 * Asserts that two equations produce the same printed output and the same
 * computed result (with no baked property values).
 */
function expectSameAs(actual: ReturnType<typeof calc>, expected: Equation) {
	expect(printEquation(actual)).toBe(printEquation(expected));
	const ctx = { propertyValues: {}, skipBaking: true };
	expect(computeEquation(actual, ctx)).toEqual(computeEquation(expected, ctx));
}

// ─── Literals ────────────────────────────────────────────────────────────────

describe('calc template — literals', () => {
	it('parses a unitless number', () => {
		expectSameAs(calc`42`, $.val('42'));
	});

	it('parses a number with a px unit', () => {
		expectSameAs(calc`10px`, $.val('10px'));
	});

	it('parses a percentage', () => {
		expectSameAs(calc`50%`, $.val('50%'));
	});

	it('parses a decimal number with a unit', () => {
		expectSameAs(calc`1.5rem`, $.val('1.5rem'));
	});

	it('accepts an outer calc() wrapper', () => {
		expectSameAs(calc`calc(10px)`, $.val('10px'));
	});
});

// ─── Arithmetic ──────────────────────────────────────────────────────────────

describe('calc template — arithmetic', () => {
	it('parses addition', () => {
		expectSameAs(calc`10px + 5px`, $.add($.val('10px'), $.val('5px')));
	});

	it('parses subtraction', () => {
		expectSameAs(calc`10px - 5px`, $.subtract($.val('10px'), $.val('5px')));
	});

	it('parses multiplication', () => {
		expectSameAs(calc`2 * 10px`, $.multiply($.val('2'), $.val('10px')));
	});

	it('parses division', () => {
		expectSameAs(calc`10px / 2`, $.divide($.val('10px'), $.val('2')));
	});

	it('respects operator precedence (* before +)', () => {
		expectSameAs(
			calc`10px + 2 * 5px`,
			$.add($.val('10px'), $.multiply($.val('2'), $.val('5px'))),
		);
	});

	it('parentheses override precedence', () => {
		expectSameAs(
			calc`(10px + 5px) * 2`,
			$.multiply($.add($.val('10px'), $.val('5px')), $.val('2')),
		);
	});

	it('chains multiple additions left-to-right', () => {
		expectSameAs(
			calc`1px + 2px + 3px`,
			$.add($.add($.val('1px'), $.val('2px')), $.val('3px')),
		);
	});

	it('handles unary negation', () => {
		expectSameAs(calc`-1 * 10px`, $.multiply($.val('-1'), $.val('10px')));
	});
});

// ─── Token interpolation ─────────────────────────────────────────────────────

describe('calc template — token interpolation', () => {
	it('wraps an interpolated token', () => {
		expectSameAs(calc`${tokenA}`, $.token(tokenA));
	});

	it('adds a token and a literal', () => {
		expectSameAs(calc`${tokenA} + 10px`, $.add($.token(tokenA), $.val('10px')));
	});

	it('multiplies two tokens', () => {
		expectSameAs(
			calc`${tokenA} * ${tokenB}`,
			$.multiply($.token(tokenA), $.token(tokenB)),
		);
	});

	it('tracks tokens from interpolations', () => {
		const eq = calc`${tokenA} + ${tokenB}`;
		expect(eq.tokens).toEqual([tokenA, tokenB]);
	});

	it('supports tuple fallback token syntax', () => {
		const eq = calc`${[tokenA, tokenB]}`;
		expectSameAs(eq, $.token(tokenA, $.token(tokenB)));
		expect(eq.tokens).toEqual([tokenA, tokenB]);
	});

	it('supports token fallback to a literal', () => {
		const eq = calc`${[tokenA, '10px']}`;
		expectSameAs(eq, $.token(tokenA, $.val('10px')));
		expect(eq.tokens).toEqual([tokenA]);
	});
});

// ─── Equation interpolation ──────────────────────────────────────────────────

describe('calc template — equation interpolation', () => {
	it('embeds an existing equation node', () => {
		const inner = $.multiply($.token(tokenA), $.val('2'));
		expectSameAs(
			calc`${inner} + 10px`,
			$.add($.multiply($.token(tokenA), $.val('2')), $.val('10px')),
		);
	});
});

// ─── Functions ───────────────────────────────────────────────────────────────

describe('calc template — functions', () => {
	it('parses clamp()', () => {
		expectSameAs(
			calc`clamp(0px, ${tokenA}, 100px)`,
			$.fn('clamp', $.val('0px'), $.token(tokenA), $.val('100px')),
		);
	});

	it('parses min()', () => {
		expectSameAs(
			calc`min(10px, ${tokenA})`,
			$.fn('min', $.val('10px'), $.token(tokenA)),
		);
	});

	it('parses max()', () => {
		expectSameAs(
			calc`max(${tokenA}, 100px)`,
			$.fn('max', $.token(tokenA), $.val('100px')),
		);
	});

	it('parses sin()', () => {
		expectSameAs(calc`sin(0)`, $.fn('sin', $.val('0')));
	});

	it('parses nested function call', () => {
		expectSameAs(
			calc`clamp(0px, min(${tokenA}, 50px), 100px)`,
			$.fn(
				'clamp',
				$.val('0px'),
				$.fn('min', $.token(tokenA), $.val('50px')),
				$.val('100px'),
			),
		);
	});
});

// ─── Error cases ─────────────────────────────────────────────────────────────

describe('calc template — error cases', () => {
	it('throws on empty input', () => {
		expect(() => calc``).toThrow(SyntaxError);
	});

	it('throws on unmatched parenthesis', () => {
		expect(() => calc`(10px + 5px`).toThrow();
	});

	it('throws on unexpected character', () => {
		expect(() => calc`10px @ 5px`).toThrow(SyntaxError);
	});

	it('throws when trailing content remains after a complete expression', () => {
		// Two complete expressions side by side with no operator
		expect(() => calc`10px 5px`).toThrow(SyntaxError);
	});
});
