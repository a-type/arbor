import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import {
	computeEquation,
	Equation,
	printComputationResult,
	printEquation,
} from './index.js';
import { css } from './parseCalc.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

const tokenA = createToken('foo');
const tokenB = createToken('bar');
const tokenC = createToken('baz');

function expectSingleAstNode(
	result: Equation,
	type: string,
	value: string,
	unit?: string,
) {
	expect(result.ast).toBeDefined();
	expect(result.ast.type).toBe('Value');
	if (!result.ast || result.ast.type !== 'Value') {
		throw new Error('Expected AST root to be a Value node');
	}
	expect(result.ast.children.size).toBe(1);
	const child = result.ast.children.first;
	if (!child) {
		throw new Error('Expected AST root to have a single child');
	}
	if (!('type' in child) || !('value' in child)) {
		throw new Error('Expected AST child to have type and value properties');
	}
	expect(child.type).toBe(type);
	expect(child.value).toBe(value);
	if (unit) {
		if (!('unit' in child)) {
			throw new Error('Expected AST child to have a unit property');
		}
		expect(child.unit).toBe(unit);
	}
}

function expectSingleVar(result: Equation, name: string) {
	expect(result.ast).toBeDefined();
	expect(result.ast.type).toBe('Value');
	if (!result.ast || result.ast.type !== 'Value') {
		throw new Error('Expected AST root to be a Value node');
	}
	expect(result.ast.children.size).toBe(1);
	const child = result.ast.children.first;
	if (!child) {
		throw new Error('Expected AST root to have a single child');
	}
	if (!('type' in child) || !('name' in child) || !('children' in child)) {
		throw new Error('Expected AST child to have type and name properties');
	}
	expect(child.type).toBe('Function');
	expect(child.name).toBe('var');
	expect(child.children!.size).toBe(1);
	const varNameNode = child.children!.first;
	if (!varNameNode) {
		throw new Error('Expected var() function to have a name argument');
	}
	if (!('type' in varNameNode) || !('name' in varNameNode)) {
		throw new Error('Expected var() name argument to have type and value');
	}
	expect(varNameNode.type).toBe('Identifier');
	expect(varNameNode.name).toBe(name);
}

describe('css template — literals', () => {
	it('parses a unitless number', () => {
		expectSingleAstNode(css`42`, 'Number', '42');
	});

	it('parses a number with a px unit', () => {
		expectSingleAstNode(css`10px`, 'Dimension', '10', 'px');
	});

	it('parses a percentage', () => {
		expectSingleAstNode(css`50%`, 'Percentage', '50');
	});

	it('parses a decimal number with a unit', () => {
		expectSingleAstNode(css`1.5rem`, 'Dimension', '1.5', 'rem');
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
		expectSingleVar(css`var(--x-foo)`, '--x-foo');
	});

	it('parses negation', () => {
		expectSingleAstNode(css`-5px`, 'Dimension', '-5', 'px');
	});
});

describe('css template — token interpolation', () => {
	it('interpolates bare token names', () => {
		expect(css`
			${tokenA}
		`.ast).toEqual(css`var(--x-foo)`.ast);
	});

	it('interpolates tokens as values', () => {
		expect(css`
			color: ${tokenA};
		`.ast).toEqual(css`
			color: var(--x-foo);
		`.ast);
	});

	it('interpolates tokens as property names', () => {
		expect(css`
			${tokenA}: 10px;
		`.ast).toEqual(css`
			--x-foo: 10px;
		`.ast);
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
		expect(eq.ast).toEqual(css`var(--x-foo,var(--x-bar))`.ast);
		expect(eq.tokens).toEqual([tokenA, tokenB]);
		expect(printEquation(eq)).toBe(`var(--x-foo,var(--x-bar))`);
	});

	it('supports token fallback to a literal', () => {
		const eq = css`
			${[tokenA, '10px']}
		`;
		expect(eq.ast).toEqual(css`var(--x-foo, 10px)`.ast);
		expect(eq.tokens).toEqual([tokenA]);
	});

	it('collects tokens from nested stylesheet interpolations', () => {
		const sheetA = css`
			${tokenA}: 10px;
			color: ${tokenB};
		`;
		const sheetB = css`
			${sheetA}
			background: ${tokenC};
		`;

		expect(sheetB.tokens).toEqual([tokenA, tokenB, tokenC]);
	});
});

describe('css template — equation interpolation', () => {
	it('embeds an existing equation node', () => {
		const inner = css`
			${tokenA} * 2
		`;
		expect(css`
			${inner} + 10px
		`.ast).toEqual(
			// implicit calc() is added when inner is created
			css`
			calc(${tokenA} * 2) + 10px
		`.ast,
		);
	});
});

describe('css template — functions', () => {
	it('parses if() with style() clauses', () => {
		const eq = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(printEquation(eq)).toBe(
			`if(style(--size: "2xl"): 1em; else: 0.25em;)`,
		);
	});

	it('parses an oklch color with all features', () => {
		const eq = css`oklch(from ${tokenA} calc(l * 1.5) calc(c * 0.5) h / 30%)`;
		expect(printEquation(eq)).toBe(
			`oklch(from ${tokenA.var} calc(l * 1.5) calc(c * 0.5) h / 30%)`,
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
		expect(printEquation(eq)).toBe(`oklch(from ${tokenA.var} calc(l / 2) c h)`);
	});

	it('drops empty concat parts in function args', () => {
		const eq = css`oklch(${''}98% 0.1 90)`;
		expect(printEquation(eq)).toBe(`oklch(98% 0.1 90)`);
	});
});

describe('css template — error cases', () => {
	it('throws on empty input', () => {
		expect(() => css``).toThrow(SyntaxError);
	});

	it('throws on unexpected character', () => {
		expect(() => css`10px @ 5px`).toThrow(SyntaxError);
	});
});

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
		// calc(1 / 2) simplifies to 0.5; calc(l * 1.5) cannot simplify (l unknown)
		// Source string whitespace is preserved
		expect(simplified).toBe(
			`light-dark(${tokenA.var}, oklch(calc(l * 1.5) c 0.5))`,
		);
	});
});

describe('css template — arithmetic', () => {
	it('handles arithmetic expressions', () => {
		expect(
			printEquation(css`
				${tokenA} + 10px
			`),
		).toBe(`calc(${tokenA.var} + 10px)`);
	});

	it('accepts an outer calc() wrapper', () => {
		expect(printEquation(css`calc(${tokenA} + 10px)`)).toBe(
			`calc(${tokenA.var} + 10px)`,
		);
	});
});

describe('css template — computation', () => {
	it('does arithmetic and respects operator precedence', () => {
		expect(printComputationResult(computeEquation(css`2 * 3 + 1`))).toBe(`7`);
	});

	it('simplifies arithmetic with units when possible', () => {
		expect(printComputationResult(computeEquation(css`10px + 5px`))).toBe(
			`15px`,
		);
		expect(printComputationResult(computeEquation(css`10px - 5px`))).toBe(
			`5px`,
		);
		expect(printComputationResult(computeEquation(css`10px * 2`))).toBe(`20px`);
		expect(printComputationResult(computeEquation(css`10px / 2`))).toBe(`5px`);
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

	it('can divide unit values by scalars', () => {
		expect(printComputationResult(computeEquation(css`100% / 2`))).toBe(`50%`);
		expect(printComputationResult(computeEquation(css`1rem / 2`))).toBe(
			`0.5rem`,
		);
	});
});

describe('css template — baking', () => {
	it('bakes token values with arithmetic into a single value', () => {
		const equation = css`
			${tokenA} + 10px
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: '5px',
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('15px');
	});

	it('bakes a token value with fallback by ignoring fallback value', () => {
		const equation = css`
			${[tokenA, '10px']} + 5px
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: '5px',
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('10px');
	});

	it('does not bake a token with fallback if token value is not known', () => {
		const equation = css`
			${[tokenA, '7px']} + 5px
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					// tokenA is intentionally left undefined to trigger fallback
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('calc(var(--x-foo, 7px) + 5px)');
	});

	it('bakes a token value into a concatenated list', () => {
		const equation = css`
			0 0 5px ${tokenA}
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: 'red',
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('0 0 5px red');
	});

	it('bakes a token assigned as a full CSS equation', () => {
		const equation = css`
			${tokenA} * 2
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: css`calc(10px + 5px)`,
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('30px');
	});

	it('avoids infinite recursion of token references', () => {
		const equation = css`var(${tokenA.name})`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: equation,
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('var(--x-foo)');
	});

	it('retains recursive token reference even if fallback was provided', () => {
		const equation = css`
			${[tokenA, '10px']}
		`;
		const result = printComputationResult(
			computeEquation(equation, {
				propertyValues: {
					[tokenA.name]: equation,
				},
				skipBaking: false,
			}),
		);
		expect(result).toBe('var(--x-foo, 10px)');
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
