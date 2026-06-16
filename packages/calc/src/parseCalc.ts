/**
 * @file parseCalc.ts
 *
 * The `css` tagged template literal.
 *
 * Always returns a single `Equation` type regardless of content:
 *  - Value expressions (`10px`, `var(--x)`) → `ast.type === 'Value'`
 *  - Stylesheet blocks (`color: red; &:hover { … }`) → `ast.type === 'DeclarationList'`
 *
 * Token tracking works uniformly across both shapes, including when a
 * stylesheet `Equation` is interpolated into another template.
 */

import type { Token } from '@arbor-css/tokens';
import { isToken } from '@arbor-css/tokens';
import * as csstree from 'css-tree';
import { type Equation, isCalcEquation, isCssStylesheet } from './index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

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
export type Css = typeof css;

// ─── if() pre-processing ─────────────────────────────────────────────────────

let _ifCounter = 0;

function extractIfCalls(input: string): {
	str: string;
	rawIf: Record<string, string>;
} {
	const rawIf: Record<string, string> = {};
	let result = '';
	let i = 0;
	while (i < input.length) {
		const ifIdx = input.indexOf('if(', i);
		if (ifIdx === -1) {
			result += input.slice(i);
			break;
		}
		result += input.slice(i, ifIdx);
		let depth = 0,
			end = ifIdx + 3;
		while (end < input.length) {
			if (input[end] === '(') depth++;
			else if (input[end] === ')') {
				if (depth === 0) {
					end++;
					break;
				}
				depth--;
			}
			end++;
		}
		const key = `--arbor-if-${_ifCounter++}`;
		rawIf[key] = input.slice(ifIdx, end);
		result += `var(${key})`;
		i = end;
	}
	return { str: result, rawIf };
}

// ─── Interpolation helpers ────────────────────────────────────────────────────

/**
 * Convert an interpolated value to a CSS string fragment for embedding in the
 * template. Also populates `tokens` with any `Token` objects encountered.
 *
 * @param forPropertyName  When true, a Token should emit `--name` (not `var(…)`).
 */
function interpToString(
	value: CalcInterpolation,
	forPropertyName: boolean,
	tokens: Token[],
): string {
	if (Array.isArray(value)) {
		if (forPropertyName) {
			throw new SyntaxError(
				`css: tokens with fallbacks cannot be used in property names`,
			);
		}
		// first value is always a Token
		tokens.push(value[0]);
		return `var(${value[0].name}, ${interpToString(value[1], forPropertyName, tokens)})`;
	}
	if (isToken(value)) {
		tokens.push(value);
		return forPropertyName ? value.name : `var(${value.name})`;
	}
	if (isCalcEquation(value)) {
		// Merge tokens from the nested equation, including stylesheet equations.
		tokens.push(...value.tokens);
		if (isCssStylesheet(value)) {
			// Serialize the stylesheet for inlining.
			return serializeStylesheet(value);
		}
		// Value expression — embed the generated CSS.
		return csstree.generate(value.ast);
	}
	return String(value);
}

/** Serialize a stylesheet Equation's DeclarationList to CSS text (no baking). */
function serializeStylesheet(eq: Equation): string {
	// Walk the DeclarationList and emit property: value; pairs and blocks.
	const nodes = [...(eq.ast as csstree.DeclarationList).children];
	return serializeNodes(nodes, eq._rawIf);
}

function serializeNodes(
	nodes: csstree.CssNode[],
	rawIf: Record<string, string> | undefined,
): string {
	return nodes
		.map((n) => {
			if (n.type === 'Declaration') {
				const d = n as csstree.Declaration;
				let val = csstree.generate(d.value);
				if (rawIf)
					for (const [k, v] of Object.entries(rawIf))
						val = val.replace(`var(${k})`, v);
				return `${d.property}: ${val};`;
			}
			if (n.type === 'Rule') {
				const r = n as csstree.Rule;
				const scope = csstree.generate(r.prelude).trim();
				const inner = serializeNodes([...r.block.children], rawIf);
				return `${scope} {\n${inner}\n}`;
			}
			if (n.type === 'Atrule') {
				const a = n as csstree.Atrule;
				const scope = `@${a.name}${a.prelude ? ' ' + csstree.generate(a.prelude) : ''}`;
				if (a.block) {
					const inner = serializeNodes([...a.block.children], rawIf);
					return `${scope} {\n${inner}\n}`;
				}
				return `${scope};`;
			}
			return '';
		})
		.filter(Boolean)
		.join('\n');
}

// ─── Mode detection ───────────────────────────────────────────────────────────

/** Returns true when the resolved CSS string should be parsed as a declarationList. */
function isStylesheetContent(input: string): boolean {
	let depth = 0,
		seenNonColon = false;
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (ch === '(' || ch === '[') {
			depth++;
			seenNonColon = true;
		} else if (ch === ')' || ch === ']') depth--;
		else if (ch === '{') {
			if (depth === 0) return true;
			depth++;
			seenNonColon = true;
		} else if (ch === '}') depth--;
		else if (depth === 0) {
			if (ch === ';') return true;
			if (ch === ':' && seenNonColon) return true;
			if (ch !== ':' && ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r')
				seenNonColon = true;
		}
	}
	return false;
}

// ─── css tagged template ──────────────────────────────────────────────────────

/**
 * Tagged template literal for CSS value expressions and stylesheet blocks.
 *
 * Always returns an `Equation`. Use `isCssStylesheet(result)` to check if
 * the result is a stylesheet block (DeclarationList AST).
 *
 * Token tracking works for all interpolation types including nested equations.
 */
export function css(
	strings: TemplateStringsArray,
	...values: CalcInterpolation[]
): Equation {
	const tokens: Token[] = [];

	// Check for invalid stylesheet-in-value interpolations.
	// A stylesheet can only be interpolated where stylesheet content is expected.
	// We detect this after building the full string.

	// Step 1: Build CSS string.
	let cssStr = '';
	for (let i = 0; i < strings.length; i++) {
		cssStr += strings[i];
		if (i < values.length) {
			const v = values[i];
			// Determine if this slot is in property-name position
			// (the next string piece starts with ':').
			const nextPiece = strings[i + 1] ?? '';
			const isPropertyName = nextPiece.trimStart().startsWith(':');

			if (isCalcEquation(v) && isCssStylesheet(v) && !isPropertyName) {
				// Stylesheet interpolated at top level — will go into stylesheet mode.
				cssStr += interpToString(v, false, tokens);
			} else {
				cssStr += interpToString(
					v as CalcInterpolation,
					isPropertyName,
					tokens,
				);
			}
		}
	}

	cssStr = cssStr.trim();
	if (!cssStr) throw new SyntaxError('css: expression must not be empty');

	// Step 2: Extract if() calls (css-tree can't parse them).
	const { str: processed, rawIf } = extractIfCalls(cssStr);

	// Step 3: Determine parse context and parse.
	if (isStylesheetContent(processed)) {
		// Stylesheet mode — parse as declarationList.
		let ast: csstree.CssNode;
		try {
			ast = csstree.parse(processed, {
				context: 'declarationList',
				parseCustomProperty: true,
			}) as csstree.CssNode;
		} catch (e) {
			throw new SyntaxError(
				`css: failed to parse stylesheet: ${e instanceof Error ? e.message : String(e)}`,
			);
		}
		return {
			ast,
			tokens,
			_rawIf: Object.keys(rawIf).length > 0 ? rawIf : undefined,
		};
	}

	// Value mode — parse as a value expression.
	// Auto-wrap bare arithmetic in calc().
	const needsCalc =
		hasTopLevelArithmetic(processed) && Object.keys(rawIf).length === 0;
	const valueSrc = needsCalc ? `calc(${processed})` : processed;

	let ast: csstree.CssNode;
	try {
		ast = csstree.parse(valueSrc, {
			context: 'value',
			parseCustomProperty: true,
		}) as csstree.CssNode;
	} catch (e) {
		throw new SyntaxError(
			`css: failed to parse value "${valueSrc}": ${e instanceof Error ? e.message : String(e)}`,
		);
	}

	if (ast.type === 'Value') {
		const children = [...(ast as csstree.Value).children];
		if (children.length === 0)
			throw new SyntaxError('css: expression must not be empty');
	}

	return {
		ast,
		tokens,
		_rawIf: Object.keys(rawIf).length > 0 ? rawIf : undefined,
	};
}

function hasTopLevelArithmetic(str: string): boolean {
	let depth = 0;
	for (let i = 0; i < str.length; i++) {
		const ch = str[i];
		if (ch === '(' || ch === '[') depth++;
		else if (ch === ')' || ch === ']') depth--;
		else if (
			depth === 0 &&
			(ch === '+' || ch === '-' || ch === '*') &&
			str[i - 1] !== '('
		) {
			// Arithmetic operator at top level
			return true;
		} else if (depth === 0 && ch === '/') {
			// Only arithmetic if preceded and followed by values (not CSS shorthand)
			const before = str.slice(0, i).trimEnd();
			const after = str.slice(i + 1).trimStart();
			if (before && after && !after.startsWith('/')) return true;
		}
	}
	return false;
}
