import type { Token } from '@arbor-css/tokens';
import { isToken } from '@arbor-css/tokens';
import type { Equation, TokenOperation } from './index.js';
import { $, isCalcEquation } from './index.js';

/**
 * A recursive fallback tuple: `[Token, Token | NestedFallbackTuple]`.
 * Parsed into nested `$.token(first, $.token(second, ...))` trees.
 *
 * @example
 * `[tokenA, tokenB]` → `$.token(tokenA, $.token(tokenB))`
 * `[tokenA, [tokenB, tokenC]]` → `$.token(tokenA, $.token(tokenB, $.token(tokenC)))`
 */
export type NestedFallbackTuple = [
	Token,
	CalcInterpolation | NestedFallbackTuple,
];

export type CalcInterpolation =
	| Token
	| Equation
	| number
	| string
	| NestedFallbackTuple;

// ─── Tokenizer ──────────────────────────────────────────────────────────────

type LexToken =
	| { kind: 'number'; value: string; pos: number }
	| { kind: 'plus'; pos: number }
	| { kind: 'minus'; pos: number }
	| { kind: 'star'; pos: number }
	| { kind: 'slash'; pos: number }
	| { kind: 'lparen'; pos: number }
	| { kind: 'rparen'; pos: number }
	| { kind: 'comma'; pos: number }
	| { kind: 'ident'; value: string; pos: number }
	| { kind: 'placeholder'; index: number; pos: number }
	| { kind: 'eof'; pos: number };

function tokenize(input: string): LexToken[] {
	const tokens: LexToken[] = [];
	let pos = 0;

	while (pos < input.length) {
		// Skip whitespace
		if (/\s/.test(input[pos])) {
			pos++;
			continue;
		}

		const start = pos;

		// Placeholder: __P0__, __P1__, …
		if (input.startsWith('__P', pos)) {
			const match = input.slice(pos).match(/^__P(\d+)__/);
			if (match) {
				tokens.push({
					kind: 'placeholder',
					index: parseInt(match[1], 10),
					pos: start,
				});
				pos += match[0].length;
				continue;
			}
		}

		// Number (with optional CSS unit): 10, 10.5, .5, 10px, 1.5rem, 50%
		const numMatch = input.slice(pos).match(/^(\d+\.?\d*|\.\d+)([a-zA-Z%]+)?/);
		if (numMatch) {
			tokens.push({ kind: 'number', value: numMatch[0], pos: start });
			pos += numMatch[0].length;
			continue;
		}

		// Single-char tokens
		switch (input[pos]) {
			case '+':
				tokens.push({ kind: 'plus', pos: start });
				pos++;
				continue;
			case '-':
				tokens.push({ kind: 'minus', pos: start });
				pos++;
				continue;
			case '*':
				tokens.push({ kind: 'star', pos: start });
				pos++;
				continue;
			case '/':
				tokens.push({ kind: 'slash', pos: start });
				pos++;
				continue;
			case '(':
				tokens.push({ kind: 'lparen', pos: start });
				pos++;
				continue;
			case ')':
				tokens.push({ kind: 'rparen', pos: start });
				pos++;
				continue;
			case ',':
				tokens.push({ kind: 'comma', pos: start });
				pos++;
				continue;
		}

		// Identifier (function name, PI, etc.)
		const identMatch = input.slice(pos).match(/^[a-zA-Z_][a-zA-Z0-9_-]*/);
		if (identMatch) {
			tokens.push({ kind: 'ident', value: identMatch[0], pos: start });
			pos += identMatch[0].length;
			continue;
		}

		throw new SyntaxError(
			`calc: unexpected character '${input[pos]}' at position ${pos}`,
		);
	}

	tokens.push({ kind: 'eof', pos: input.length });
	return tokens;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

class Parser {
	private pos = 0;

	constructor(
		private readonly tokens: LexToken[],
		private readonly interpolations: CalcInterpolation[],
		/** When true, allows space-separated concatenation at the top level and
		 * within function arguments. Used by the `css` tagged template. */
		private readonly cssMode: boolean = false,
	) {}

	parse(): Equation {
		if (this.cssMode) {
			return this.parseCssExpr();
		}
		const result = this.parseAddSub();
		const remaining = this.peek();
		if (remaining.kind !== 'eof') {
			throw new SyntaxError(
				`calc: unexpected '${remaining.kind}' at position ${remaining.pos} — expression was not fully consumed`,
			);
		}
		return result;
	}

	private peek(): LexToken {
		return this.tokens[this.pos];
	}

	private consume(): LexToken {
		return this.tokens[this.pos++];
	}

	private expect(kind: LexToken['kind'], context?: string): LexToken {
		const tok = this.consume();
		if (tok.kind !== kind) {
			throw new SyntaxError(
				`calc: expected '${kind}'${context ? ` ${context}` : ''} but got '${tok.kind}' at position ${tok.pos}`,
			);
		}
		return tok;
	}

	// ── CSS-mode helpers ─────────────────────────────────────────────────────

	/**
	 * In CSS mode, returns true when the current token can start a space-
	 * separated continuation (i.e. it is not an arithmetic operator, comma,
	 * closing paren, or end of input).
	 */
	private isCssConcatContinuation(): boolean {
		const kind = this.peek().kind;
		return (
			kind !== 'eof' &&
			kind !== 'comma' &&
			kind !== 'rparen' &&
			kind !== 'plus' &&
			kind !== 'minus' &&
			kind !== 'star' &&
			kind !== 'slash'
		);
	}

	/**
	 * Parses one CSS value expression.  Like {@link parseAddSub} but in CSS
	 * mode, any non-operator primaries that follow are collected into a
	 * space-separated {@link ConcatenateOperation} node.  This lets the parser
	 * handle things like `in hsl` inside `color-mix(in hsl, …)` and top-level
	 * multi-value shorthands like `${py} ${px}`.
	 */
	private parseCssExpr(): Equation {
		const first = this.parseAddSub();
		if (!this.cssMode || !this.isCssConcatContinuation()) return first;

		const parts: Equation[] = [first];
		while (this.isCssConcatContinuation()) {
			parts.push(this.parseAddSub());
		}
		return $.concat(parts, ' ');
	}

	// expr := addSub
	private parseAddSub(): Equation {
		let left = this.parseMulDiv();

		while (true) {
			const next = this.peek();
			if (next.kind === 'plus') {
				this.consume();
				left = $.add(left, this.parseMulDiv());
			} else if (next.kind === 'minus') {
				this.consume();
				left = $.subtract(left, this.parseMulDiv());
			} else {
				break;
			}
		}

		return left;
	}

	// mulDiv := unary (('*' | '/') unary)*
	private parseMulDiv(): Equation {
		let left = this.parseUnary();

		while (true) {
			const next = this.peek();
			if (next.kind === 'star') {
				this.consume();
				left = $.multiply(left, this.parseUnary());
			} else if (next.kind === 'slash') {
				this.consume();
				left = $.divide(left, this.parseUnary());
			} else {
				break;
			}
		}

		return left;
	}

	// unary := '-' primary | primary
	private parseUnary(): Equation {
		const next = this.peek();
		if (next.kind === 'minus') {
			this.consume();
			const after = this.peek();
			// Merge '-' directly into an adjacent number literal (e.g. -1, -10px)
			if (after.kind === 'number') {
				this.consume();
				return $.val(
					`-${(after as Extract<LexToken, { kind: 'number' }>).value}`,
				);
			}
			// Otherwise negate by multiplying by -1
			return $.multiply($.val(-1), this.parsePrimary());
		}
		return this.parsePrimary();
	}

	// primary := '(' expr ')' | fnCall | number | placeholder | ident
	private parsePrimary(): Equation {
		const next = this.peek();

		if (next.kind === 'lparen') {
			this.consume();
			const inner = this.parseAddSub();
			this.expect('rparen', 'to close parenthesized expression');
			return inner;
		}

		if (next.kind === 'number') {
			this.consume();
			return $.val((next as Extract<LexToken, { kind: 'number' }>).value);
		}

		if (next.kind === 'placeholder') {
			this.consume();
			const token = next as Extract<LexToken, { kind: 'placeholder' }>;
			return interpolationToEquation(
				this.interpolations[token.index],
				token.pos,
			);
		}

		if (next.kind === 'ident') {
			const ident = this.consume() as Extract<LexToken, { kind: 'ident' }>;

			// function call?
			if (this.peek().kind === 'lparen') {
				this.consume(); // consume '('
				return this.parseFnCall(ident.value, ident.pos);
			}

			// standalone identifier (e.g. PI)
			return $.val(ident.value);
		}

		throw new SyntaxError(
			`calc: unexpected token '${next.kind}' at position ${next.pos}`,
		);
	}

	// fnCall := already consumed 'name(' — parse args then ')'
	private parseFnCall(name: string, namePos: number): Equation {
		const args: Equation[] = [];

		while (this.peek().kind !== 'rparen' && this.peek().kind !== 'eof') {
			args.push(this.cssMode ? this.parseCssExpr() : this.parseAddSub());
			if (this.peek().kind === 'comma') this.consume();
		}

		this.expect('rparen', `to close '${name}('`);

		return $.fn(name, ...args);
	}
}

function nestedTupleToEquation(tuple: NestedFallbackTuple): TokenOperation {
	const [first, second] = tuple;
	if (Array.isArray(second)) {
		return $.token(first, nestedTupleToEquation(second as NestedFallbackTuple));
	}
	return $.token(
		first,
		interpolationToEquation(second as CalcInterpolation, 0),
	);
}

function interpolationToEquation(
	value: CalcInterpolation,
	pos: number,
): Equation {
	if (Array.isArray(value)) return nestedTupleToEquation(value);
	if (isToken(value)) return $.token(value);
	if (isCalcEquation(value)) return value;
	if (typeof value === 'number') return $.val(value);
	if (typeof value === 'string') return $.val(value);
	throw new SyntaxError(
		`calc: unsupported interpolated value type at position ${pos}`,
	);
}

// ─── Helper: strip outer calc() wrapper ─────────────────────────────────────

function stripCalcWrapper(input: string): string {
	if (!/^calc\s*\(/i.test(input)) return input;
	const openIdx = input.indexOf('(');
	let depth = 0;
	for (let i = openIdx; i < input.length; i++) {
		if (input[i] === '(') depth++;
		else if (input[i] === ')') {
			depth--;
			if (depth === 0) {
				// Only strip if the matching ')' is the very last character
				if (i === input.length - 1) {
					return input.slice(openIdx + 1, i).trim();
				}
				break;
			}
		}
	}
	return input;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Tagged template literal that parses a CSS calc()-style expression into an
 * {@link Equation} tree.
 *
 * Interpolated values may be {@link Token} objects, existing {@link Equation}
 * nodes, plain numbers, or literal strings.
 *
 * @example
 * ```ts
 * const eq = calc`${myToken} * 2 + 10px`;
 * const eq2 = calc`clamp(0px, ${myToken}, 100px)`;
 * ```
 *
 * An outer `calc(…)` wrapper is optional and will be stripped automatically.
 * Unsupported syntax throws a {@link SyntaxError} with a position hint.
 */
export function calc(
	strings: TemplateStringsArray,
	...values: CalcInterpolation[]
): Equation {
	// Build a single string, replacing each interpolation with a unique marker
	let input = '';
	for (let i = 0; i < strings.length; i++) {
		input += strings[i];
		if (i < values.length) input += `__P${i}__`;
	}

	input = input.trim();

	if (input.length === 0) {
		throw new SyntaxError('calc: expression must not be empty');
	}

	input = stripCalcWrapper(input);

	const lexTokens = tokenize(input);
	return new Parser(lexTokens, values).parse();
}

export type Calc = typeof calc;

// ─── css tagged template ─────────────────────────────────────────────────────

/**
 * Tagged template literal for general CSS value expressions.  A superset of
 * {@link calc} that additionally supports:
 *
 * - **Space-separated concatenation** — adjacent interpolations or values with
 *   no arithmetic operator between them are joined with a space:
 *   ```ts
 *   css`${paddingBlock} ${paddingInline}`
 *   // → "var(--block) var(--inline)"
 *   ```
 *
 * - **Non-calc CSS functions** — functions like `color-mix`, `oklch`, etc. are
 *   emitted without an extra `calc()` wrapper, and their arguments may contain
 *   space-separated values (e.g. the `in hsl` color-space in `color-mix`):
 *   ```ts
 *   css`color-mix(in hsl, ${token}, black)`
 *   // → "color-mix(in hsl, var(--token), black)"
 *   ```
 *
 * An outer `calc(…)` wrapper is optional and will be stripped automatically
 * (same as {@link calc}).
 */
export function css(
	strings: TemplateStringsArray,
	...values: CalcInterpolation[]
): Equation {
	let input = '';
	for (let i = 0; i < strings.length; i++) {
		input += strings[i];
		if (i < values.length) input += `__P${i}__`;
	}

	input = input.trim();

	if (input.length === 0) {
		throw new SyntaxError('css: expression must not be empty');
	}

	input = stripCalcWrapper(input);

	const lexTokens = tokenize(input);
	return new Parser(lexTokens, values, true).parse();
}

export type Css = typeof css;
