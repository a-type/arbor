import type { Token } from '@arbor-css/tokens';
import { isToken } from '@arbor-css/tokens';
import type {
	CssBlock,
	CssDeclaration,
	CssFragment,
	CssStylesheet,
	CssStylesheetNode,
	Equation,
	TokenOperation,
} from './index.js';
import { $, isCssStylesheet, isCalcEquation } from './index.js';

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
	| CssStylesheet
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
	| { kind: 'lbrace'; pos: number }
	| { kind: 'rbrace'; pos: number }
	| { kind: 'lparen'; pos: number }
	| { kind: 'rparen'; pos: number }
	| { kind: 'comma'; pos: number }
	/** A raw single character that is valid in CSS selectors/at-rules but not
	 *  in value expressions: `&`, `@`, `.`, `#`, `>`, `~`, `+` (already covered),
	 *  `[`, `]`, `^`, `$`, `|`, `!`, `?`, `_` etc. These are preserved as literal
	 *  chars when reconstructing property names or selectors. */
	| { kind: 'rawchar'; value: string; pos: number }
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
			case '{':
				tokens.push({ kind: 'lbrace', pos: start });
				pos++;
				continue;
			case '}':
				tokens.push({ kind: 'rbrace', pos: start });
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

		// Raw single characters that are valid in CSS selectors and at-rules but
		// are not standard calc/value operators: &, @, ., #, >, ~, [, ], ^, $,
		// |, !, ?, =, etc.  We preserve these as raw chars so that stylesheet-
		// mode parsing can reconstruct the original selector string.
		if (/[&@.#>~\[\]^$|!?=]/.test(input[pos])) {
			tokens.push({ kind: 'rawchar', value: input[pos], pos: start });
			pos++;
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
		private readonly input: string = '',
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

	/**
	 * Parses a stylesheet (block of declarations and/or scoped rules).
	 * The caller is responsible for determining that this is a stylesheet context
	 * (e.g. by looking for top-level `;` or `{` in the token stream).
	 */
	parseStylesheet(): CssStylesheet {
		const children = this.parseStylesheetBody(false);
		if (this.peek().kind !== 'eof') {
			throw new SyntaxError(
				`css: unexpected token '${this.peek().kind}' at position ${this.peek().pos} while parsing stylesheet`,
			);
		}
		return { type: 'stylesheet', children };
	}

	/**
	 * Parses the body of a stylesheet or a scoped block.
	 * When `insideBlock` is true, stops at `}`.
	 */
	private parseStylesheetBody(insideBlock: boolean): CssStylesheetNode[] {
		const nodes: CssStylesheetNode[] = [];

		while (true) {
			const tok = this.peek();

			if (tok.kind === 'eof') break;
			if (insideBlock && tok.kind === 'rbrace') break;

			// A placeholder at the top of a stylesheet body could be a fragment
			// (another stylesheet), or a property name. We look ahead.
			if (tok.kind === 'placeholder') {
				const interpolation = this.interpolations[(tok as Extract<LexToken, {kind:'placeholder'}>).index];
				if (isCssStylesheet(interpolation)) {
					// splice in the fragment
					this.consume();
					nodes.push({ type: 'fragment', children: interpolation.children });
					continue;
				}
				// Otherwise it might be a property name (unusual but allowed).
				// Fall through to property parsing below.
			}

			// Try to parse a declaration or a scoped block.
			// We need to look ahead past the potential property name to find `:` or `{`.
			const node = this.parseStylesheetItem();
			if (node) {
				nodes.push(node);
			}
		}

		return nodes;
	}

	/**
	 * Parses a single declaration or scoped block within a stylesheet body.
	 * Returns null if we hit EOF or closing brace (signaling end of body).
	 */
	private parseStylesheetItem(): CssStylesheetNode | null {
		const tok = this.peek();

		if (tok.kind === 'eof' || tok.kind === 'rbrace') {
			return null;
		}

		// Parse the property name / selector by tracking positions in the
		// original input string so that whitespace is preserved.
		//
		// CSS declarations: `color: red`, `--x-var: value`
		//   → property name is a single word (ident or customprop), no rawchars,
		//     no whitespace before the colon.
		//
		// CSS selector blocks: `&:hover { }`, `@media (max-width: 400px) { }`,
		//   `.class { }`, `&::before { }`
		//   → selectors may contain rawchars (`&`, `.`, etc.), multiple tokens,
		//     whitespace, or pseudo-selector colons (`:hover`, `::before`).
		//
		// Strategy: scan ahead (without consuming) to determine if the "name"
		// ends at a `{` or a `:`. If we see a `{` before a declaration `:`,
		// it's a block. If the name starts with a rawchar or contains rawchars,
		// it's a selector block (look only for `{`). Otherwise it's a declaration.
		const isSelector = this.startsWithSelectorToken();

		let nameStartPos: number = tok.pos;
		let nameEndPos: number = tok.pos;
		const namePlaceholders: Array<{ marker: string; replacement: string }> = [];
		let parenDepth = 0;

		while (true) {
			const cur = this.peek();
			if (cur.kind === 'eof') break;
			if (cur.kind === 'lbrace' && parenDepth === 0) break;
			if (cur.kind === 'rbrace') break;

			// Stop at a top-level `:` only if this is definitely a declaration
			// (not a selector). For selectors, `:` is part of the name
			// (pseudo-selector like `:hover`, `::before`).
			if (cur.kind === 'colon' && parenDepth === 0 && !isSelector) {
				break;
			}

			if (cur.kind === 'lparen') parenDepth++;
			if (cur.kind === 'rparen') {
				parenDepth--;
				if (parenDepth < 0) break; // unmatched paren — stop
			}

			// For placeholder tokens in the name, record a substitution
			if (cur.kind === 'placeholder') {
				const idx = (cur as Extract<LexToken, {kind:'placeholder'}>).index;
				const interp = this.interpolations[idx];
				if (isCssStylesheet(interp)) {
					throw new SyntaxError(
						`css: cannot use a stylesheet fragment as a property name or selector at position ${cur.pos}`,
					);
				}
				const replacement = interpolationToPropertyString(
					interp as CalcInterpolation,
					cur.pos,
				);
				const marker = `__P${idx}__`;
				namePlaceholders.push({ marker, replacement });
			}

			const endOfTok = this.tokenEndPos(cur);
			nameEndPos = endOfTok;
			this.consume();
		}

		// Extract the name from the original input using recorded positions,
		// then substitute any placeholder markers.
		let nameStr = this.input.slice(nameStartPos, nameEndPos).trim();
		for (const { marker, replacement } of namePlaceholders) {
			nameStr = nameStr.replace(marker, replacement);
		}
		nameStr = nameStr.trim();

		// An empty name followed by EOF or closing brace means we consumed only
		// whitespace / empty-string interpolations at the end of the template.
		// Skip it silently rather than throwing.
		const nextKind = this.peek().kind;
		if (!nameStr && (nextKind === 'eof' || nextKind === 'rbrace')) {
			return null;
		}

		if (this.peek().kind === 'colon') {
			// Declaration: `prop: value;`
			// Use parse() (not parseCssExpr()) so that comma-separated values
			// like `box-shadow: a, b` are treated as a single value, not split.
			this.consume(); // consume `:`
			const value = this.parse();
			if (this.peek().kind === 'semicolon') {
				this.consume(); // consume `;`
			}
			return {
				type: 'declaration',
				property: nameStr,
				value,
			} satisfies CssDeclaration;
		}

		if (this.peek().kind === 'lbrace') {
			// Block: `scope { ... }`
			if (!nameStr) {
				throw new SyntaxError(
					`css: empty selector before '{' at position ${nameStartPos}`,
				);
			}
			this.consume(); // consume `{`
			const children = this.parseStylesheetBody(true);
			this.expect('rbrace', `to close '${nameStr} {'`);
			return {
				type: 'block',
				scope: nameStr,
				children,
			} satisfies CssBlock;
		}

		throw new SyntaxError(
			`css: expected ':' or '{' after '${nameStr}' at position ${this.peek().pos}`,
		);
	}

	/**
	 * Looks at the tokens starting at the current position (without consuming)
	 * to determine whether this stylesheet item starts like a CSS selector
	 * (and therefore should scan to `{` for its block) or like a CSS property
	 * declaration (and should scan to `:` for its separator).
	 *
	 * A selector is identified by:
	 * - Starting with a `rawchar` token (`&`, `.`, `#`, `>`, `@`, etc.)
	 * - Starting with `[` (attribute selector)
	 * - Starting with `*` (universal selector)
	 *
	 * Everything else is treated as a property declaration.
	 */
	private startsWithSelectorToken(): boolean {
		const first = this.tokens[this.pos];
		if (!first) return false;
		if (first.kind === 'rawchar') return true;
		if (first.kind === 'star') return true; // universal selector `* { }`
		return false;
	}

	/**
	 * Returns the end position of a lex token in the original input string.
	 * This is used to extract substrings for property names and selectors.
	 */
	private tokenEndPos(tok: LexToken): number {		switch (tok.kind) {
			case 'ident':
				return tok.pos + (tok as Extract<LexToken, {kind:'ident'}>).value.length;
			case 'customprop':
				return tok.pos + (tok as Extract<LexToken, {kind:'customprop'}>).value.length;
			case 'number':
				return tok.pos + (tok as Extract<LexToken, {kind:'number'}>).value.length;
			case 'string':
				return tok.pos + (tok as Extract<LexToken, {kind:'string'}>).value.length;
			case 'rawchar':
				return tok.pos + 1;
			case 'placeholder': {
				// placeholder format is __P<n>__
				const idx = (tok as Extract<LexToken, {kind:'placeholder'}>).index;
				return tok.pos + `__P${idx}__`.length;
			}
			default:
				// single-char tokens: +, -, *, /, :, ;, {, }, (, ), ,
				return tok.pos + 1;
		}
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
			kind !== 'rbrace' &&
			kind !== 'colon' &&
			kind !== 'semicolon' &&
			kind !== 'plus' &&
			kind !== 'minus' &&
			kind !== 'star' &&
			kind !== 'slash'
		);
	}

	private isEmptyConcatPart(value: Equation): boolean {
		return value.type === 'literal' && value.value === '';
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

		const nonEmptyParts = parts.filter((part) => !this.isEmptyConcatPart(part));
		if (nonEmptyParts.length === 0) {
			return $.val('');
		}
		if (nonEmptyParts.length === 1) {
			return nonEmptyParts[0];
		}
		return $.concat(nonEmptyParts, ' ');
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
	if (isCssStylesheet(value)) {
		throw new SyntaxError(
			`calc: a stylesheet fragment cannot be used as a CSS value at position ${pos}. ` +
				`Stylesheet fragments can only be interpolated at the top level of a stylesheet template.`,
		);
	}
	if (isCalcEquation(value)) return value;
	if (typeof value === 'number') return $.val(value);
	if (typeof value === 'string') return $.val(value);
	throw new SyntaxError(
		`calc: unsupported interpolated value type at position ${pos} (${JSON.stringify(value)})`,
	);
}

/**
 * Renders an interpolation value to a plain string suitable for use as a
 * property name or selector fragment (not as a CSS value).
 * For tokens, uses the token's name (e.g. `--x-foo`), not its `var()` form.
 */
function interpolationToPropertyString(
	value: CalcInterpolation,
	pos: number,
): string {
	if (isToken(value)) return value.name;
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	throw new SyntaxError(
		`calc: unsupported interpolated value type for property name/selector at position ${pos} (${JSON.stringify(value)})`,
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
 *
 * When the template contains top-level property declarations (`prop: value;`)
 * or scoped blocks (`scope { ... }`), the result is a {@link CssStylesheet}
 * instead of an `Equation`. Use {@link printStylesheet} to render it.
 *
 * @example Multi-line stylesheet usage:
 * ```ts
 * const sheet = css`
 *   color: ${token};
 *   background: ${bgToken};
 *   &:hover {
 *     opacity: 0.8;
 *   }
 * `;
 * printStylesheet(sheet);
 * ```
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

	// Detect stylesheet mode: if there is a `;` or `{` at the top level
	// (depth 0, outside function-call parentheses), OR if any interpolated
	// value is a stylesheet fragment at the top level of the token stream,
	// parse as a stylesheet.
	if (
		isStylesheetInput(lexTokens) ||
		hasTopLevelStylesheetInterpolation(lexTokens, values)
	) {
		return new Parser(lexTokens, values, input).parseStylesheet() as unknown as Equation;
	}

	return new Parser(lexTokens, values, input).parse();
}

/**
 * Scans the token stream for top-level `;`, `{`, or `:` tokens (not nested
 * inside parentheses) to determine whether the input should be parsed as a
 * stylesheet rather than a single CSS value expression.
 *
 * Top-level `:` at depth 0 is an unambiguous declaration separator — CSS value
 * expressions never contain a bare colon outside of a function call (where it
 * would be inside parentheses).
 */
function isStylesheetInput(tokens: LexToken[]): boolean {
	let depth = 0;
	let seenNonColon = false; // colon must be preceded by a name token
	for (const tok of tokens) {
		if (tok.kind === 'lparen') {
			depth++;
			seenNonColon = true;
			continue;
		}
		if (tok.kind === 'rparen') {
			depth--;
			seenNonColon = true;
			continue;
		}
		if (depth === 0) {
			if (tok.kind === 'semicolon' || tok.kind === 'lbrace') {
				return true;
			}
			// A colon at depth 0 that is not the first token is a declaration separator.
			if (tok.kind === 'colon' && seenNonColon) {
				return true;
			}
		}
		if (tok.kind !== 'colon') {
			seenNonColon = true;
		}
	}
	return false;
}

/**
 * Returns true if any of the `values` interpolations is a `CssStylesheet` and
 * appears at the top level of the token stream (not inside parentheses).
 * Used to detect cases like `css\`${otherMixin.apply({})}\`` where the
 * surrounding template has no `;` or `{` but should still be a stylesheet.
 */
function hasTopLevelStylesheetInterpolation(
	tokens: LexToken[],
	values: CalcInterpolation[],
): boolean {
	let depth = 0;
	for (const tok of tokens) {
		if (tok.kind === 'lparen') {
			depth++;
			continue;
		}
		if (tok.kind === 'rparen') {
			depth--;
			continue;
		}
		if (depth === 0 && tok.kind === 'placeholder') {
			const interp = values[(tok as Extract<LexToken, { kind: 'placeholder' }>).index];
			if (isCssStylesheet(interp)) return true;
		}
	}
	return false;
}

export type Css = typeof css;
