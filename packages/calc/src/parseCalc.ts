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
	| { kind: 'string'; value: string; pos: number }
	| { kind: 'plus'; pos: number }
	| { kind: 'minus'; pos: number }
	| { kind: 'star'; pos: number }
	| { kind: 'slash'; pos: number }
	| { kind: 'colon'; pos: number }
	| { kind: 'semicolon'; pos: number }
	| { kind: 'lparen'; pos: number }
	| { kind: 'rparen'; pos: number }
	| { kind: 'comma'; pos: number }
	| { kind: 'ident'; value: string; pos: number }
	| { kind: 'customprop'; value: string; pos: number }
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

		if (input[pos] === '"' || input[pos] === "'") {
			const quote = input[pos];
			pos++;
			let value = quote;
			let closed = false;
			while (pos < input.length) {
				const char = input[pos];
				value += char;
				if (char === '\\' && pos + 1 < input.length) {
					pos++;
					value += input[pos];
				} else if (char === quote) {
					closed = true;
					pos++;
					break;
				}
				pos++;
			}
			if (!closed) {
				throw new SyntaxError(
					`calc: unterminated string literal starting at position ${start}`,
				);
			}
			tokens.push({ kind: 'string', value, pos: start });
			continue;
		}

		// CSS custom property: --ident (e.g. --x-foo, --my-var)
		const customPropMatch = input
			.slice(pos)
			.match(/^--([a-zA-Z_][a-zA-Z0-9_-]*)/);
		if (customPropMatch) {
			tokens.push({
				kind: 'customprop',
				value: customPropMatch[0],
				pos: start,
			});
			pos += customPropMatch[0].length;
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
			case ':':
				tokens.push({ kind: 'colon', pos: start });
				pos++;
				continue;
			case ';':
				tokens.push({ kind: 'semicolon', pos: start });
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

/**
 * CSS math functions whose arguments accept arithmetic expressions (including
 * `/` as division).  A `/` token encountered *outside* one of these functions
 * is treated as a literal alpha separator (e.g. `oklch(0.5 0.2 270 / 50%)`)
 * rather than as the division operator.
 */
const CSS_MATH_FUNCTIONS = new Set([
	'calc',
	'min',
	'max',
	'clamp',
	'round',
	'mod',
	'rem',
	'sin',
	'cos',
	'tan',
	'asin',
	'acos',
	'atan',
	'atan2',
	'pow',
	'sqrt',
	'hypot',
	'log',
	'exp',
	'abs',
	'sign',
]);

class Parser {
	private pos = 0;
	/**
	 * Tracks nesting depth inside CSS math functions.  Starts at 1 so that
	 * top-level expressions are also arithmetic-capable (e.g. bare
	 * `calc(…)`-free expressions).  Reset to 0 when entering a non-math
	 * function (e.g. `oklch`, `hsl`) so that `/` there is a literal separator.
	 */
	private mathFnDepth = 1;

	constructor(
		private readonly tokens: LexToken[],
		private readonly interpolations: CalcInterpolation[],
	) {}

	parse(): Equation {
		const first = this.parseCssExpr();
		if (this.peek().kind !== 'comma') return first;
		const parts: Equation[] = [first];
		while (this.peek().kind === 'comma') {
			this.consume(); // eat comma
			parts.push(this.parseCssExpr());
		}
		return $.concat(parts, ', ');
	}

	private peek(): LexToken {
		return this.tokens[this.pos];
	}

	private peekNext(): LexToken {
		return this.tokens[this.pos + 1] ?? this.tokens[this.tokens.length - 1];
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
			kind !== 'colon' &&
			kind !== 'semicolon' &&
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
	 *
	 * When outside a CSS math function (`mathFnDepth === 0`), a `/` token is
	 * treated as a literal alpha separator (e.g. `oklch(0.5 0.2 270 / 50%)`)
	 * rather than as the division operator.
	 */
	private parseCssExpr(): Equation {
		const first = this.parseAddSub();

		const canContinue = () =>
			this.isCssConcatContinuation() ||
			(this.mathFnDepth === 0 && this.peek().kind === 'slash');

		if (!canContinue()) return first;

		const parts: Equation[] = [first];
		while (canContinue()) {
			if (this.mathFnDepth === 0 && this.peek().kind === 'slash') {
				this.consume();
				parts.push($.val('/'));
			} else {
				parts.push(this.parseAddSub());
			}
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
			} else if (next.kind === 'slash' && this.mathFnDepth > 0) {
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

		if (next.kind === 'string') {
			this.consume();
			return $.val((next as Extract<LexToken, { kind: 'string' }>).value);
		}

		if (next.kind === 'placeholder') {
			this.consume();
			const token = next as Extract<LexToken, { kind: 'placeholder' }>;
			return interpolationToEquation(
				this.interpolations[token.index],
				token.pos,
			);
		}

		if (next.kind === 'customprop') {
			this.consume();
			return $.val((next as Extract<LexToken, { kind: 'customprop' }>).value);
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
		if (name === 'if') {
			return this.parseIfFunction(name, namePos);
		}

		if (name === 'style') {
			return this.parseStyleFunction(name, namePos);
		}

		const args: Equation[] = [];

		const savedDepth = this.mathFnDepth;
		if (CSS_MATH_FUNCTIONS.has(name)) {
			this.mathFnDepth = savedDepth + 1;
		} else {
			// Non-math functions (e.g. oklch, hsl, color-mix) treat '/' as a
			// literal separator, not division.
			this.mathFnDepth = 0;
		}

		while (this.peek().kind !== 'rparen' && this.peek().kind !== 'eof') {
			args.push(this.parseCssExpr());
			if (this.peek().kind === 'comma') this.consume();
		}

		this.mathFnDepth = savedDepth;

		this.expect('rparen', `to close '${name}('`);

		return $.fn(name, ...args);
	}

	private parseStyleFunction(name: string, namePos: number): Equation {
		const property = this.parseCssExpr();
		if (this.peek().kind !== 'colon') {
			throw new SyntaxError(
				`calc: expected ':' in '${name}(' at position ${namePos}`,
			);
		}
		this.consume();
		const value = this.parseCssExpr();
		this.expect('rparen', `to close '${name}('`);
		return $.fn(name, property, value);
	}

	private parseIfFunction(name: string, namePos: number): Equation {
		const args: Equation[] = [];

		while (this.peek().kind !== 'rparen' && this.peek().kind !== 'eof') {
			const isElseClause =
				this.peek().kind === 'ident' &&
				(this.peek() as Extract<LexToken, { kind: 'ident' }>).value ===
					'else' &&
				this.peekNext().kind === 'colon';

			if (isElseClause) {
				this.consume();
				this.expect('colon', `after else in '${name}('`);
				const value = this.parseCssExpr();
				args.push(value);
				if (this.peek().kind === 'semicolon') {
					this.consume();
				}
				break;
			}

			const condition = this.parseCssExpr();
			this.expect('colon', `after condition in '${name}('`);
			const value = this.parseCssExpr();
			args.push(condition, value);

			if (this.peek().kind === 'semicolon') {
				this.consume();
			} else if (this.peek().kind !== 'rparen') {
				throw new SyntaxError(
					`calc: expected ';' or ')' in '${name}(' at position ${this.peek().pos}`,
				);
			}
		}

		this.expect('rparen', `to close '${name}('`);

		if (args.length === 0) {
			throw new SyntaxError(
				`calc: '${name}(' requires at least one clause at position ${namePos}`,
			);
		}

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
		`calc: unsupported interpolated value type at position ${pos} (${JSON.stringify(value)})`,
	);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Tagged template literal for CSS value expressions.
 *
 * Supports all CSS value syntax including:
 * - **Arithmetic inside `calc()`** — use a `calc(…)` wrapper for math expressions:
 *   ```ts
 *   css`calc(${myToken} * 2 + 10px)`
 *   css`calc(clamp(0px, ${myToken}, 100px))`
 *   ```
 * - **Space-separated concatenation** — adjacent values with no operator are joined with a space:
 *   ```ts
 *   css`${paddingBlock} ${paddingInline}`
 *   // → "var(--block) var(--inline)"
 *   ```
 * - **Non-calc CSS functions** — functions like `color-mix`, `oklch`, etc.:
 *   ```ts
 *   css`color-mix(in hsl, ${token}, black)`
 *   // → "color-mix(in hsl, var(--token), black)"
 *   ```
 *
 * An outer `calc(…)` wrapper is stripped automatically when the expression
 * contains only a single math expression.
 * Unsupported syntax throws a {@link SyntaxError} with a position hint.
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

	const lexTokens = tokenize(input);
	return new Parser(lexTokens, values).parse();
}

export type Css = typeof css;
