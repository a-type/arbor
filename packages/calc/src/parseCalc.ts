import type { Token } from '@arbor-css/tokens';
import { isToken } from '@arbor-css/tokens';
import type { Equation } from './index.js';
import { $ } from './index.js';

export type CalcInterpolation = Token | Equation | number | string;

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

/**
 * Functions supported by the underlying Equation tree. Calls to any other
 * function name will throw a clear error.
 */
const SUPPORTED_FUNCTIONS = new Set([
	'clamp',
	'min',
	'max',
	'sin',
	'cos',
	'tan',
	'abs',
	'exp',
	'log',
	'pow',
]);

class Parser {
	private pos = 0;

	constructor(
		private readonly tokens: LexToken[],
		private readonly interpolations: CalcInterpolation[],
	) {}

	parse(): Equation {
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
				return $.val(`-${(after as Extract<LexToken, { kind: 'number' }>).value}`);
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
		if (!SUPPORTED_FUNCTIONS.has(name)) {
			throw new SyntaxError(
				`calc: unsupported function '${name}' at position ${namePos}. ` +
					`Supported functions: ${[...SUPPORTED_FUNCTIONS].join(', ')}`,
			);
		}

		const args: Equation[] = [];

		while (this.peek().kind !== 'rparen' && this.peek().kind !== 'eof') {
			args.push(this.parseAddSub());
			if (this.peek().kind === 'comma') this.consume();
		}

		this.expect('rparen', `to close '${name}('`);

		switch (name) {
			case 'clamp': {
				if (args.length !== 3) {
					throw new SyntaxError(
						`calc: clamp() requires exactly 3 arguments (min, value, max) at position ${namePos}, got ${args.length}`,
					);
				}
				// CSS clamp(min, val, max) → $.clamp(equation, min, max)
				return $.clamp(args[1], args[0], args[2]);
			}
			default:
				return $.fn(name, ...args);
		}
	}
}

function interpolationToEquation(
	value: CalcInterpolation,
	pos: number,
): Equation {
	if (isToken(value)) return $.token(value);
	if (isEquation(value)) return value;
	if (typeof value === 'number') return $.val(value);
	if (typeof value === 'string') return $.val(value);
	throw new SyntaxError(
		`calc: unsupported interpolated value type at position ${pos}`,
	);
}

function isEquation(value: CalcInterpolation): value is Equation {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		'tokens' in value
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
