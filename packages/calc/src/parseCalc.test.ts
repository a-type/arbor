import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import {
	$,
	computeEquation,
	Equation,
	printComputationResult,
	printEquation,
} from './index.js';
import { css } from './parseCalc.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

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
		expect(printEquation(css`calc(10px)`)).toBe(`calc(10px)`);
		// computing + printing should remove calc wrapper
		expect(
			printComputationResult(
				computeEquation(css`calc(10px)`, { propertyValues: {} }),
			),
		).toBe('10px');
	});

	it('parsers a var(--*) reference inlined in the template', () => {
		expectSameAs(css`var(--x-foo)`, $.val('var(--x-foo)'));
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
		expect(printEquation(eq)).toBe(`${tokenA.varFallback(tokenB.var)}`);
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

	it('parses if() with style() clauses', () => {
		const eq = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(printEquation(eq)).toBe(
			`if(style(--size: "2xl"): 1em; else: 0.25em;)`,
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

	it('parses hsl() with / alpha syntax', () => {
		const eq = css`hsl(270 60% 50% / 20%)`;
		expect(printEquation(eq)).toBe(`hsl(270 60% 50% / 20%)`);
	});

	it('parses rgb() with / alpha syntax', () => {
		const eq = css`rgb(255 0 0 / 0.5)`;
		expect(printEquation(eq)).toBe(`rgb(255 0 0 / 0.5)`);
	});

	it('parses color() with / alpha syntax', () => {
		const eq = css`color(display-p3 1 0.5 0 / 80%)`;
		expect(printEquation(eq)).toBe(`color(display-p3 1 0.5 0 / 80%)`);
	});

	it('parses oklch() with an interpolated token and / alpha syntax', () => {
		const eq = css`oklch(from ${tokenA} l c h / 50%)`;
		expect(printEquation(eq)).toBe(`oklch(from ${tokenA.var} l c h / 50%)`);
	});

	it('still parses division inside calc() nested in a color function', () => {
		const eq = css`oklch(from ${tokenA} calc(l / 2) c h)`;
		expect(printEquation(eq)).toBe(
			`oklch(from ${tokenA.var} calc((l / 2)) c h)`,
		);
	});

	it('drops empty concat parts in function args', () => {
		const eq = css`oklch(${''}98% 0.1 90)`;
		expect(printEquation(eq)).toBe(`oklch(98% 0.1 90)`);
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

	it('simplifies calc() of single literals within colors', () => {
		const eq = css`oklch(from ${tokenA} calc(l * 1) calc(c) calc((h)))`;
		expect(
			printComputationResult(computeEquation(eq, { propertyValues: {} })),
		).toBe(`oklch(from ${tokenA.var} l c h)`);
	});

	it('handles comma separated tokens as a bare string', () => {
		const eq = css`var(--ring), var(--shadow)`;
		expect(printEquation(eq)).toBe(`var(--ring), var(--shadow)`);
	});

	it('handles space separated tokens as a bare string', () => {
		const eq = css`0 0 0 0 black`;
		expect(printEquation(eq)).toBe(`0 0 0 0 black`);
	});

	it('interpolates tokens into space separated lists', () => {
		const eq = css`0 0 0 0 ${tokenA}`;
		expect(printEquation(eq)).toBe(`0 0 0 0 ${tokenA.var}`);
	});

	it('handles light-dark wrapping two colors with computation', () => {
		const eq = css`light-dark(${tokenA}, oklch(calc(l * 1.5) c calc(1 / 2)))`;
		const simplified = printComputationResult(
			computeEquation(eq, { propertyValues: {} }),
		);
		// TODO: eliminate double calc()
		expect(simplified).toBe(
			`light-dark(${tokenA.var}, oklch(calc(calc(l * 1.5)) c 0.5))`,
		);
	});
});

describe('css template — arithmetic still works', () => {
	it('handles arithmetic expressions', () => {
		// TODO: add calc() wrapper here?
		expect(
			printEquation(css`
				${tokenA} + 10px
			`),
		).toBe(`(${tokenA.var} + 10px)`);
	});

	it('respects operator precedence', () => {
		expectSameAs(
			css`2 * ${tokenA} + 1px`,
			$.add($.multiply($.val('2'), $.token(tokenA)), $.val('1px')),
		);
	});

	it('accepts an outer calc() wrapper', () => {
		expect(printEquation(css`calc(${tokenA} + 10px)`)).toBe(
			`calc((${tokenA.var} + 10px))`,
		);
	});

	it('can multiply scalars with percentages', () => {
		expect(printComputationResult(computeEquation(css`2 * 50%`))).toBe(`100%`);
		expect(printComputationResult(computeEquation(css`1 * 100%`))).toBe(`100%`);
		expect(printComputationResult(computeEquation(css`0.5 * 100%`))).toBe(
			`50%`,
		);
		expect(printComputationResult(computeEquation(css`2 * 50% + 10px`))).toBe(
			`calc(100% + 10px)`,
		);
	});
});

describe('css template — if() pre-baking', () => {
	it('pre-bakes matching style() conditions when property value is known', () => {
		const eq = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(
			printComputationResult(
				computeEquation(eq, {
					propertyValues: {
						'--size': '"2xl"',
					},
					skipBaking: false,
				}),
			),
		).toEqual('1em');
	});

	it('pre-bakes non-matching style() conditions to else branch', () => {
		const eq = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"lg"',
				},
				skipBaking: false,
			}),
		).toEqual({ type: 'numeric', value: 0.25, unit: 'em' });
	});

	it('does not pre-bake style() when condition checks non-custom property', () => {
		const eq = css`if(style(color: red): 1em; else: 0.25em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					color: 'red',
				},
				skipBaking: false,
			}),
		).toEqual({
			type: 'calc',
			value: 'if(style(color: red): 1em; else: 0.25em;)',
		});
	});

	it('does not pre-bake if baking is disabled', () => {
		const eq = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"2xl"',
				},
				skipBaking: true,
			}),
		).toEqual({
			type: 'calc',
			value: 'if(style(--size: "2xl"): 1em; else: 0.25em;)',
		});
	});

	it('parses and prints multiple condition branches', () => {
		const eq = css`if(style(--size: "2xl"): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)`;
		expect(printEquation(eq)).toBe(
			'if(style(--size: "2xl"): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)',
		);
	});

	it('pre-bakes to the first matching branch', () => {
		const eq = css`if(style(--size: "2xl"): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"2xl"',
				},
				skipBaking: false,
			}),
		).toEqual({ type: 'numeric', value: 1, unit: 'em' });
	});

	it('pre-bakes to a later matching branch', () => {
		const eq = css`if(style(--size: "2xl"): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"lg"',
				},
				skipBaking: false,
			}),
		).toEqual({ type: 'numeric', value: 0.75, unit: 'em' });
	});

	it('pre-bakes to else when no branches match', () => {
		const eq = css`if(style(--size: "2xl"): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"sm"',
				},
				skipBaking: false,
			}),
		).toEqual({ type: 'numeric', value: 0.5, unit: 'em' });
	});

	it('keeps unknown branches and preserves later bakeable branches', () => {
		const eq = css`if(style(color: red): 1em; style(--size: "lg"): 0.75em; else: 0.5em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"sm"',
				},
				skipBaking: false,
			}),
		).toEqual({
			type: 'calc',
			value: 'if(style(color: red): 1em; else: 0.5em;)',
		});
	});

	it('keeps unknown branches and inlines matching later branch values', () => {
		const eq = css`if(style(color: red): 1em; style(--size: "lg"): calc(0.5em + 0.25em); else: 0.5em;)`;
		expect(
			computeEquation(eq, {
				propertyValues: {
					'--size': '"sm"',
				},
				skipBaking: false,
			}),
		).toEqual({
			type: 'calc',
			value: 'if(style(color: red): 1em; else: 0.5em;)',
		});
	});
});
