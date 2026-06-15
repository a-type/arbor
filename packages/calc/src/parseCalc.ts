/**
 * @file parseCalc.ts
 * `css` tagged template literal — parses CSS value expressions and stylesheet
 * blocks using css-tree as the underlying parser.
 */

import type { Token } from '@arbor-css/tokens';
import { isToken } from '@arbor-css/tokens';
import type { CssNode } from 'css-tree';
import * as csstree from 'css-tree';
import {
	type CssStylesheet,
	type CssStylesheetNode,
	type Equation,
	isCalcEquation,
	isCssStylesheet,
} from './index.js';

// ─── Public types ─────────────────────────────────────────────────────────────

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

		let depth = 0;
		let end = ifIdx + 3;
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

		const ifExpr = input.slice(ifIdx, end);
		const key = `--arbor-if-${_ifCounter++}`;
		rawIf[key] = ifExpr;
		result += `var(${key})`;
		i = end;
	}
	return { str: result, rawIf };
}

// ─── Interpolation resolution ─────────────────────────────────────────────────

function resolveInterpolationToString(
	value: CalcInterpolation,
	forPropertyName: boolean,
	collectedTokens: Token[],
): string {
	if (Array.isArray(value)) {
		if (forPropertyName) {
			throw new SyntaxError(
				`css: tokens with fallbacks cannot be used in property names`,
			);
		}
		// first value is always a Token
		collectedTokens.push(value[0]);
		return `var(${value[0].name}, ${resolveInterpolationToString(value[1], forPropertyName, collectedTokens)})`;
	}
	if (isToken(value)) {
		collectedTokens.push(value);
		return forPropertyName ? value.name : `var(${value.name})`;
	}
	if (isCssStylesheet(value)) {
		return '__ARBOR_SHEET_FRAGMENT__';
	}
	if (isCalcEquation(value)) {
		collectedTokens.push(...value.tokens);
		return value.source;
	}
	if (typeof value === 'number' || typeof value === 'string')
		return String(value);
	return '';
}

// ─── Mode detection ────────────────────────────────────────────────────────────

function isStylesheetString(input: string): boolean {
	let depth = 0;
	let seenNonColon = false;

	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (ch === '(' || ch === '[') {
			depth++;
			seenNonColon = true;
		} else if (ch === ')' || ch === ']') {
			depth--;
		} else if (ch === '{') {
			if (depth === 0) return true;
			depth++;
			seenNonColon = true;
		} else if (ch === '}') {
			depth--;
		} else if (depth === 0) {
			if (ch === ';') return true;
			if (ch === ':' && seenNonColon) return true;
			if (ch !== ':' && ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r')
				seenNonColon = true;
		}
	}
	return false;
}

function hasTopLevelStylesheetInterpolation(
	strings: TemplateStringsArray,
	values: CalcInterpolation[],
): boolean {
	let depth = 0;
	for (let i = 0; i < strings.length; i++) {
		for (const ch of strings[i]) {
			if (ch === '(' || ch === '[' || ch === '{') depth++;
			else if (ch === ')' || ch === ']' || ch === '}') depth--;
		}
		if (i < values.length && depth === 0 && isCssStylesheet(values[i]))
			return true;
	}
	return false;
}

// ─── Value mode parsing ───────────────────────────────────────────────────────

function hasTopLevelArithmeticOperators(ast: CssNode): boolean {
	if (ast.type !== 'Value') return false;
	return [...(ast as csstree.Value).children].some(
		(n) =>
			n.type === 'Operator' && isArithmeticOp((n as csstree.Operator).value),
	);
}

function isArithmeticOp(op: string): boolean {
	const t = op.trim();
	return t === '+' || t === '-' || t === '*' || t === '/';
}

function isConcatenatedValue(ast: CssNode): boolean {
	if (ast.type !== 'Value') return false;
	const children = [...(ast as csstree.Value).children].filter(
		(n) => n.type !== 'WhiteSpace',
	);
	if (children.length <= 1) return false;
	return !children.some((n) => n.type === 'Operator');
}

// ─── Stylesheet mode parsing ──────────────────────────────────────────────────

interface DeclItem {
	kind: 'decl';
	property: string;
	value: string;
}
interface BlockItem {
	kind: 'block';
	scope: string;
	content: string;
}
type RawItem = DeclItem | BlockItem;

function findFirstColonAtDepth0(s: string): number {
	let depth = 0;
	for (let i = 0; i < s.length; i++) {
		if (s[i] === '(' || s[i] === '[') depth++;
		else if (s[i] === ')' || s[i] === ']') depth--;
		else if (s[i] === ':' && depth === 0) return i;
	}
	return -1;
}

function splitStylesheetContent(css: string): RawItem[] {
	const items: RawItem[] = [];
	let i = 0;
	let parenDepth = 0;
	let itemStart = 0;

	while (i <= css.length) {
		const ch = i < css.length ? css[i] : undefined;

		if (ch === '(') {
			parenDepth++;
			i++;
			continue;
		}
		if (ch === ')') {
			parenDepth--;
			i++;
			continue;
		}

		if (parenDepth === 0) {
			if (ch === '{') {
				const scope = css.slice(itemStart, i).trim();
				i++;
				let braceDepth = 1;
				const innerStart = i;
				while (i < css.length && braceDepth > 0) {
					if (css[i] === '(' || css[i] === '[') parenDepth++;
					else if (css[i] === ')' || css[i] === ']') parenDepth--;
					else if (css[i] === '{') braceDepth++;
					else if (css[i] === '}') {
						braceDepth--;
						if (braceDepth === 0) break;
					}
					i++;
				}
				const content = css.slice(innerStart, i).trim();
				i++;
				if (scope) items.push({ kind: 'block', scope, content });
				itemStart = i;
				continue;
			}

			if (ch === ';' || ch === undefined) {
				const declStr = css
					.slice(itemStart, ch !== undefined ? i : css.length)
					.trim();
				if (declStr) {
					const colonIdx = findFirstColonAtDepth0(declStr);
					if (colonIdx !== -1) {
						items.push({
							kind: 'decl',
							property: declStr.slice(0, colonIdx).trim(),
							value: declStr.slice(colonIdx + 1).trim(),
						});
					}
				}
				if (ch === undefined) break;
				itemStart = i + 1;
				i++;
				continue;
			}
		}
		i++;
	}
	return items;
}

function parseStylesheetItems(
	items: RawItem[],
	tokens: Token[],
	rawIf: Record<string, string>,
): CssStylesheetNode[] {
	const children: CssStylesheetNode[] = [];

	for (const item of items) {
		if (item.kind === 'decl') {
			// Normalize internal whitespace in the value (collapse newlines/tabs to spaces)
			const normalizedValue = item.value.replace(/\s+/g, ' ').trim();

			let valueAst: CssNode;
			try {
				valueAst = csstree.parse(normalizedValue, {
					context: 'value',
					parseCustomProperty: true,
				}) as CssNode;
			} catch {
				valueAst = csstree.parse(`"${normalizedValue}"`, {
					context: 'value',
				}) as CssNode;
			}

			let valueSrc = normalizedValue;
			for (const [key, val] of Object.entries(rawIf)) {
				valueSrc = valueSrc.replace(`var(${key})`, val);
			}

			children.push({
				type: 'declaration',
				property: item.property,
				value: {
					source: valueSrc,
					ast: valueAst,
					tokens: [...tokens],
					_rawIf: Object.keys(rawIf).length > 0 ? rawIf : undefined,
					_isConcatenated: isConcatenatedValue(valueAst) || undefined,
				} as Equation,
			});
		} else {
			const blockItems = splitStylesheetContent(item.content);
			const blockChildren = parseStylesheetItems(blockItems, tokens, rawIf);
			children.push({
				type: 'block',
				scope: item.scope,
				children: blockChildren,
			});
		}
	}
	return children;
}

function parseAsStylesheet(
	cssStr: string,
	tokens: Token[],
	rawIf: Record<string, string>,
): CssStylesheet {
	if (!cssStr.trim()) return { type: 'stylesheet', children: [] };
	const items = splitStylesheetContent(cssStr);
	return {
		type: 'stylesheet',
		children: parseStylesheetItems(items, tokens, rawIf),
	};
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function css(
	strings: TemplateStringsArray,
	...values: CalcInterpolation[]
): Equation {
	const isSheetMode =
		hasTopLevelStylesheetInterpolation(strings, values) ||
		detectStylesheetFromStrings(strings, values);

	if (isSheetMode) {
		return parseStylesheetTemplate(strings, values) as unknown as Equation;
	}
	return parseValueTemplate(strings, values);
}

function detectStylesheetFromStrings(
	strings: TemplateStringsArray,
	values: CalcInterpolation[],
): boolean {
	let partial = '';
	for (let i = 0; i < strings.length; i++) {
		partial += strings[i];
		if (i < values.length) partial += '__SLOT__';
	}
	const { str: cleaned } = extractIfCalls(partial);
	return isStylesheetString(cleaned);
}

function parseValueTemplate(
	strings: TemplateStringsArray,
	values: CalcInterpolation[],
): Equation {
	const collectedTokens: Token[] = [];

	for (const value of values) {
		if (isCssStylesheet(value)) {
			throw new SyntaxError(
				`css: a stylesheet fragment cannot be used as a CSS value. ` +
					`Stylesheet fragments can only be interpolated at the top level of a stylesheet template.`,
			);
		}
	}

	let cssStr = '';
	for (let i = 0; i < strings.length; i++) {
		cssStr += strings[i];
		if (i < values.length) {
			cssStr += resolveInterpolationToString(values[i], false, collectedTokens);
		}
	}

	cssStr = cssStr.trim();
	if (cssStr.length === 0)
		throw new SyntaxError('css: expression must not be empty');

	const { str: processedStr, rawIf } = extractIfCalls(cssStr);

	let ast: CssNode;
	try {
		ast = csstree.parse(processedStr, {
			context: 'value',
			parseCustomProperty: true,
		}) as CssNode;
	} catch (e) {
		throw new SyntaxError(
			`css: failed to parse value "${processedStr}": ${e instanceof Error ? e.message : String(e)}`,
		);
	}

	if (ast.type === 'Value') {
		const children = [...(ast as csstree.Value).children];
		if (children.length === 0)
			throw new SyntaxError(`css: expression must not be empty`);
	}

	// Wrap bare arithmetic in calc() for correct CSS semantics
	const needsCalcWrap =
		Object.keys(rawIf).length === 0 && hasTopLevelArithmeticOperators(ast);

	let finalSource: string;
	let finalAst: CssNode;
	if (needsCalcWrap) {
		finalSource = `calc(${processedStr})`;
		finalAst = csstree.parse(finalSource, {
			context: 'value',
			parseCustomProperty: true,
		}) as CssNode;
	} else {
		finalSource = processedStr;
		finalAst = ast;
	}

	// Restore if() placeholders in the source for printing
	let printableSource = finalSource;
	for (const [key, val] of Object.entries(rawIf)) {
		printableSource = printableSource.replace(`var(${key})`, val);
	}

	return {
		source: printableSource,
		ast: finalAst,
		tokens: collectedTokens,
		_rawIf: Object.keys(rawIf).length > 0 ? rawIf : undefined,
		_isConcatenated: isConcatenatedValue(finalAst) || undefined,
	};
}

function parseStylesheetTemplate(
	strings: TemplateStringsArray,
	values: CalcInterpolation[],
): CssStylesheet {
	const collectedTokens: Token[] = [];

	let cssStr = '';
	for (let i = 0; i < strings.length; i++) {
		cssStr += strings[i];
		if (i < values.length) {
			const value = values[i];
			if (isCssStylesheet(value)) {
				cssStr += serializeStylesheetFragment(value);
			} else {
				const nextPiece = strings[i + 1] ?? '';
				const isPropertyName = nextPiece.trimStart().startsWith(':');
				cssStr += resolveInterpolationToString(
					value,
					isPropertyName,
					collectedTokens,
				);
			}
		}
	}

	cssStr = cssStr.trim();
	const { str: processedCss, rawIf } = extractIfCalls(cssStr);
	return parseAsStylesheet(processedCss, collectedTokens, rawIf);
}

function serializeNodes(nodes: CssStylesheetNode[]): string {
	return nodes
		.map((node) => {
			if (node.type === 'declaration')
				return `${node.property}: ${node.value.source};`;
			if (node.type === 'block')
				return `${node.scope} {\n${serializeNodes(node.children)}\n}`;
			if (node.type === 'fragment') return serializeNodes(node.children);
			return '';
		})
		.join('\n');
}

function serializeStylesheetFragment(sheet: CssStylesheet): string {
	return serializeNodes(sheet.children);
}
