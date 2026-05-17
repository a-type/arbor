import { createToken } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { $, computeEquation, Equation, printEquation } from './index.js';
import { css } from './parseCalc.js';

const tokenA = createToken('foo');
const tokenB = createToken('bar');

// ─── Equivalence helpers ─────────────────────────────────────────────────────

/**
 * Asserts that two equations produce the same printed output and the same
 * computed result (with no baked property values).
 */
function expectSameAs(actual: ReturnType<typeof css>, expected: Equation) {
	expect(printEquation(actual)).toBe(printEquation(expected));
	const ctx = { propertyValues: {}, skipBaking: true };
	expect(computeEquation(actual, ctx)).toEqual(computeEquation(expected, ctx));
}

// ─── Literals ────────────────────────────────────────────────────────────────

describe('css template — literals', () => {
	it('parses a unitless number', () => {
		expectSameAs(css`42`, $.val('42'));
	});

	it('parses a number with a px unit', () => {
		expectSameAs(css`10px`, $.val('10px'));
	});

	it('parses a percentage', () => {
		expectSameAs(css`50%`, $.val('50%'));
	});

	it('parses a decimal number with a unit', () => {
		expectSameAs(css`1.5rem`, $.val('1.5rem'));
	});

	it('accepts an outer calc() wrapper', () => {
		expectSameAs(css`calc(10px)`, $.val('10px'));
	});
});

// ─── Arithmetic ──────────────────────────────────────────────────────────────

describe('css template — arithmetic', () => {
	it('parses addition', () => {
		expectSameAs(css`10px + 5px`, $.add($.val('10px'), $.val('5px')));
	});

	it('parses subtraction', () => {
		expectSameAs(css`10px - 5px`, $.subtract($.val('10px'), $.val('5px')));
	});

	it('parses multiplication', () => {
		expectSameAs(css`2 * 10px`, $.multiply($.val('2'), $.val('10px')));
	});

	it('parses division', () => {
		expectSameAs(css`10px / 2`, $.divide($.val('10px'), $.val('2')));
	});

	it('respects operator precedence (* before +)', () => {
		expectSameAs(
			css`10px + 2 * 5px`,
			$.add($.val('10px'), $.multiply($.val('2'), $.val('5px'))),
		);
	});

	it('parentheses override precedence', () => {
		expectSameAs(
			css`(10px + 5px) * 2`,
			$.multiply($.add($.val('10px'), $.val('5px')), $.val('2')),
		);
	});

	it('chains multiple additions left-to-right', () => {
		expectSameAs(
			css`1px + 2px + 3px`,
			$.add($.add($.val('1px'), $.val('2px')), $.val('3px')),
		);
	});

	it('handles unary negation', () => {
		expectSameAs(css`-1 * 10px`, $.multiply($.val('-1'), $.val('10px')));
	});
});

// ─── Token interpolation ─────────────────────────────────────────────────────

describe('css template — token interpolation', () => {
	it('wraps an interpolated token', () => {
		expectSameAs(
			css`
				${tokenA}
			`,
			$.token(tokenA),
		);
	});

	it('adds a token and a literal', () => {
		expectSameAs(
			css`
				${tokenA} + 10px
			`,
			$.add($.token(tokenA), $.val('10px')),
		);
	});

	it('multiplies two tokens', () => {
		expectSameAs(
			css`
				${tokenA} * ${tokenB}
			`,
			$.multiply($.token(tokenA), $.token(tokenB)),
		);
	});

	it('tracks tokens from interpolations', () => {
		const eq = css`
			${tokenA} + ${tokenB}
		`;
		expect(eq.tokens).toEqual([tokenA, tokenB]);
	});

	it('supports tuple fallback token syntax', () => {
		const eq = css`
			${[tokenA, tokenB]}
		`;
		expectSameAs(eq, $.token(tokenA, $.token(tokenB)));
		expect(eq.tokens).toEqual([tokenA, tokenB]);
	});

	it('supports token fallback to a literal', () => {
		const eq = css`
			${[tokenA, '10px']}
		`;
		expectSameAs(eq, $.token(tokenA, $.val('10px')));
		expect(eq.tokens).toEqual([tokenA]);
	});
});

// ─── Equation interpolation ──────────────────────────────────────────────────

describe('css template — equation interpolation', () => {
	it('embeds an existing equation node', () => {
		const inner = $.multiply($.token(tokenA), $.val('2'));
		expectSameAs(
			css`
				${inner} + 10px
			`,
			$.add($.multiply($.token(tokenA), $.val('2')), $.val('10px')),
		);
	});
});

// ─── Functions ───────────────────────────────────────────────────────────────

describe('css template — functions', () => {
	it('parses clamp()', () => {
		expectSameAs(
			css`clamp(0px, ${tokenA}, 100px)`,
			$.fn('clamp', $.val('0px'), $.token(tokenA), $.val('100px')),
		);
	});

	it('parses min()', () => {
		expectSameAs(
			css`min(10px, ${tokenA})`,
			$.fn('min', $.val('10px'), $.token(tokenA)),
		);
	});

	it('parses max()', () => {
		expectSameAs(
			css`max(${tokenA}, 100px)`,
			$.fn('max', $.token(tokenA), $.val('100px')),
		);
	});

	it('parses sin()', () => {
		expectSameAs(css`sin(0)`, $.fn('sin', $.val('0')));
	});

	it('parses nested function call', () => {
		expectSameAs(
			css`clamp(0px, min(${tokenA}, 50px), 100px)`,
			$.fn(
				'clamp',
				$.val('0px'),
				$.fn('min', $.token(tokenA), $.val('50px')),
				$.val('100px'),
			),
		);
	});

	it('parses an oklch color with all features', () => {
		const eq = css`oklch(from ${tokenA} calc(l * 1.5) calc(c * 0.5) h / 30%)`;
		expect(printEquation(eq)).toBe(
			`oklch(from ${tokenA.var} calc((l * 1.5)) calc((c * 0.5)) h / 30%)`,
		);
	});

	it('parses an oklch color with minimal features', () => {
		const eq = css`oklch(from red l c h / 10%)`;
		expect(printEquation(eq)).toBe(`oklch(from red l c h / 10%)`);
	});
});

// ─── Error cases ─────────────────────────────────────────────────────────────

describe('css template — error cases', () => {
	it('throws on empty input', () => {
		expect(() => css``).toThrow(SyntaxError);
	});

	it('throws on unmatched parenthesis', () => {
		expect(() => css`(10px + 5px`).toThrow();
	});

	it('throws on unexpected character', () => {
		expect(() => css`10px @ 5px`).toThrow(SyntaxError);
	});
});

// ─── Space-separated concatenation ──────────────────────────────────────────

describe('css template — space-separated concatenation', () => {
	it('handles two token interpolations separated by a space', () => {
		const eq = css`
			${tokenA} ${tokenB}
		`;
		expect(printEquation(eq)).toBe(`${tokenA.var} ${tokenB.var}`);
		expect(computeEquation(eq, { propertyValues: {} })).toEqual({
			type: 'concatenated',
			value: `${tokenA.var} ${tokenB.var}`,
		});
	});

	it('handles multiple token interpolations separated by spaces', () => {
		const tokenC = createToken('baz');
		const eq = css`
			${tokenA} ${tokenB} ${tokenC}
		`;
		expect(printEquation(eq)).toBe(`${tokenA.var} ${tokenB.var} ${tokenC.var}`);
	});

	it('tracks tokens from all concatenated parts', () => {
		const eq = css`
			${tokenA} ${tokenB}
		`;
		expect(eq.tokens).toEqual([tokenA, tokenB]);
	});

	it('produces a single value when only one token is interpolated', () => {
		expectSameAs(
			css`
				${tokenA}
			`,
			$.token(tokenA),
		);
	});
});

describe('css template — non-calc functions', () => {
	it('emits color-mix without a calc() wrapper', () => {
		const eq = css`color-mix(in hsl, ${tokenA}, black)`;
		expect(printEquation(eq)).toBe(`color-mix(in hsl, ${tokenA.var}, black)`);
	});

	it('handles space-separated arguments inside function calls (e.g. in hsl)', () => {
		const eq = css`color-mix(in hsl, ${tokenA}, ${tokenB})`;
		expect(printEquation(eq)).toBe(
			`color-mix(in hsl, ${tokenA.var}, ${tokenB.var})`,
		);
	});

	it('emits clamp() without a calc() wrapper', () => {
		const eq = css`clamp(0px, ${tokenA}, 100px)`;
		expect(printEquation(eq)).toBe(`clamp(0px, ${tokenA.var}, 100px)`);
	});
});

describe('css template — arithmetic still works', () => {
	it('handles arithmetic expressions', () => {
		expectSameAs(
			css`
				${tokenA} + 10px
			`,
			$.add($.token(tokenA), $.val('10px')),
		);
	});

	it('respects operator precedence', () => {
		expectSameAs(
			css`2 * ${tokenA} + 1px`,
			$.add($.multiply($.val('2'), $.token(tokenA)), $.val('1px')),
		);
	});

	it('accepts an outer calc() wrapper', () => {
		expectSameAs(
			css`calc(${tokenA} + 10px)`,
			$.add($.token(tokenA), $.val('10px')),
		);
	});
});
