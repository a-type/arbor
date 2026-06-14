import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import {
	computeEquation,
	isCssStylesheet,
	printEquation,
	printStylesheet,
} from './calcTree.js';
import { css } from './parseCalc.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });
const tokenA = createToken('foo');
const tokenB = createToken('bar');

// ─── Detection ───────────────────────────────────────────────────────────────

describe('css template — stylesheet detection', () => {
	it('returns an Equation for single-value expressions (no semicolon or brace)', () => {
		const result = css`${tokenA}`;
		expect(isCssStylesheet(result)).toBe(false);
	});

	it('returns a CssStylesheet when input contains a top-level semicolon', () => {
		const result = css`
			color: red;
		`;
		expect(isCssStylesheet(result)).toBe(true);
	});

	it('returns a CssStylesheet when input contains a top-level brace', () => {
		const result = css`
			&:hover {
				color: red;
			}
		`;
		expect(isCssStylesheet(result)).toBe(true);
	});

	it('does NOT treat semicolons inside if() as stylesheet markers', () => {
		// if(style(--size: "2xl"): 1em; else: 0.25em;) has ; but inside parens
		const result = css`if(style(--size: "2xl"): 1em; else: 0.25em;)`;
		expect(isCssStylesheet(result)).toBe(false);
	});
});

// ─── Simple declarations ──────────────────────────────────────────────────────

describe('css template — stylesheet simple declarations', () => {
	it('parses a single declaration without trailing semicolon', () => {
		const sheet = css`
			color: red
		`;
		expect(isCssStylesheet(sheet)).toBe(true);
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe('color: red;');
	});

	it('parses a single property declaration', () => {
		const sheet = css`
			color: red;
		`;
		expect(isCssStylesheet(sheet)).toBe(true);
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(sheet.children).toHaveLength(1);
		expect(sheet.children[0]).toMatchObject({
			type: 'declaration',
			property: 'color',
		});
	});

	it('prints a single declaration', () => {
		const sheet = css`
			color: red;
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe('color: red;');
	});

	it('parses multiple declarations', () => {
		const sheet = css`
			color: red;
			background: blue;
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(sheet.children).toHaveLength(2);
		expect(printStylesheet(sheet)).toBe('color: red;\nbackground: blue;');
	});

	it('parses a CSS custom property declaration', () => {
		const sheet = css`
			--x-color: oklch(50% 0.1 270);
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe('--x-color: oklch(50% 0.1 270);');
	});

	it('interpolates a token as a property value', () => {
		const sheet = css`
			color: ${tokenA};
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe(`color: ${tokenA.var};`);
	});

	it('interpolates two tokens as property values', () => {
		const sheet = css`
			color: ${tokenA};
			background: ${tokenB};
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe(
			`color: ${tokenA.var};\nbackground: ${tokenB.var};`,
		);
	});

	it('interpolates a token name as a property name', () => {
		const sheet = css`
			${tokenA}: red;
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		// token name (not var) should be used as property name
		expect(printStylesheet(sheet)).toBe(`${tokenA.name}: red;`);
	});

	it('parses a value with space-separated parts', () => {
		const sheet = css`
			box-shadow: 0 0 0 0 transparent;
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe('box-shadow: 0 0 0 0 transparent;');
	});

	it('computes equation values when printing', () => {
		const sheet = css`
			opacity: calc(50% + 50%);
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		// computeEquation bakes calc(50% + 50%) → 100%
		expect(printStylesheet(sheet, { propertyValues: {} })).toBe('opacity: 100%;');
	});
});

// ─── Scoped blocks ────────────────────────────────────────────────────────────

describe('css template — stylesheet scoped blocks', () => {
	it('parses a pseudo-selector block', () => {
		const sheet = css`
			&:hover {
				color: red;
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(sheet.children).toHaveLength(1);
		const block = sheet.children[0];
		expect(block.type).toBe('block');
		if (block.type !== 'block') throw new Error();
		expect(block.scope).toBe('&:hover');
		expect(block.children).toHaveLength(1);
	});

	it('prints a pseudo-selector block', () => {
		const sheet = css`
			&:hover {
				color: red;
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe('&:hover {\n  color: red;\n}');
	});

	it('parses a media query block', () => {
		const sheet = css`
			@media (max-width: 400px) {
				color: red;
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		const block = sheet.children[0];
		expect(block.type).toBe('block');
		if (block.type !== 'block') throw new Error();
		expect(block.scope).toBe('@media (max-width: 400px)');
	});

	it('prints a media query block with declarations', () => {
		const sheet = css`
			@media (max-width: 400px) {
				color: red;
				background: blue;
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe(
			'@media (max-width: 400px) {\n  color: red;\n  background: blue;\n}',
		);
	});

	it('parses mixed declarations and blocks', () => {
		const sheet = css`
			color: red;
			&:hover {
				color: blue;
			}
			background: white;
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(sheet.children).toHaveLength(3);
		expect(sheet.children[0].type).toBe('declaration');
		expect(sheet.children[1].type).toBe('block');
		expect(sheet.children[2].type).toBe('declaration');
	});

	it('handles nested scoped blocks', () => {
		const sheet = css`
			.parent {
				color: blue;
				&:hover {
					color: red;
				}
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe(
			'.parent {\n  color: blue;\n  &:hover {\n    color: red;\n  }\n}',
		);
	});

	it('interpolates tokens inside scoped blocks', () => {
		const sheet = css`
			&:hover {
				color: ${tokenA};
			}
		`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(printStylesheet(sheet)).toBe(`&:hover {\n  color: ${tokenA.var};\n}`);
	});
});

// ─── Fragment interpolation ──────────────────────────────────────────────────

describe('css template — stylesheet fragment interpolation', () => {
	it('splices a stylesheet fragment into another stylesheet', () => {
		const inner = css`
			color: red;
		`;
		const outer = css`
			background: blue;
			${inner}
			opacity: 1;
		`;
		if (!isCssStylesheet(outer)) throw new Error('expected stylesheet');
		expect(printStylesheet(outer)).toBe(
			'background: blue;\ncolor: red;\nopacity: 1;',
		);
	});

	it('splices a fragment that contains a block', () => {
		const inner = css`
			&:hover {
				color: red;
			}
		`;
		const outer = css`
			background: blue;
			${inner}
		`;
		if (!isCssStylesheet(outer)) throw new Error('expected stylesheet');
		expect(printStylesheet(outer)).toBe(
			'background: blue;\n&:hover {\n  color: red;\n}',
		);
	});

	it('splices multiple fragments', () => {
		const a = css`color: red;`;
		const b = css`background: blue;`;
		const combined = css`
			${a}
			${b}
		`;
		if (!isCssStylesheet(combined)) throw new Error('expected stylesheet');
		expect(printStylesheet(combined)).toBe('color: red;\nbackground: blue;');
	});
});

// ─── Assertion errors ─────────────────────────────────────────────────────────

describe('css template — stylesheet assertion errors', () => {
	it('throws a helpful error when printEquation receives a stylesheet', () => {
		const sheet = css`color: red;`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(() => printEquation(sheet as any)).toThrowError(
			/expected a CSS value.*received a stylesheet block/,
		);
	});

	it('throws a helpful error when computeEquation receives a stylesheet', () => {
		const sheet = css`color: red;`;
		if (!isCssStylesheet(sheet)) throw new Error('expected stylesheet');
		expect(() => computeEquation(sheet as any)).toThrowError(
			/expected a CSS value.*received a stylesheet block/,
		);
	});

	it('throws when a stylesheet fragment is used as a CSS value interpolation', () => {
		const sheet = css`color: red;`;
		expect(() => {
			css`calc(${sheet as any} + 10px)`;
		}).toThrowError(/stylesheet fragment cannot be used as a CSS value/);
	});
});
