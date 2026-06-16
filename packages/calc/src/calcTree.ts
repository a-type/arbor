/**
 * @file calcTree.ts
 *
 * CSS value and stylesheet representation backed by css-tree.
 *
 * Design principles:
 *  - A single `Equation` type represents ALL css`` results: both value
 *    expressions (`10px`, `var(--x)`) and stylesheet blocks (`color: red;`).
 *  - The `ast` field is always a css-tree node. Callers use `isCssStylesheet`
 *    to check whether the AST is a DeclarationList vs a Value.
 *  - Token tracking works uniformly across both shapes.
 *  - Baking / simplification operates directly on the css-tree AST via
 *    `walk` + list-mutation, never on raw strings.
 *  - `if(…)` functions (Arbor's custom non-standard syntax) are hoisted out
 *    before css-tree parsing via `_rawIf` and restored at print time.
 */

import { isToken, Token } from '@arbor-css/tokens';
import type {
	CssNode,
	DeclarationList,
	FunctionNode,
	List,
	ListItem,
	NumberNode,
} from 'css-tree';
import * as csstree from 'css-tree';
import { functionResolvers } from './functions.js';

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * The one return type from `css\`\``.
 *
 * `ast` is a css-tree node:
 *  - `Value`           — for single-value expressions (`10px`, `var(--x)`, …)
 *  - `DeclarationList` — for stylesheet blocks (`color: red; &:hover { … }`)
 *
 * Use `isCssStylesheet(eq)` to discriminate at runtime.
 */
export interface Equation {
	readonly ast: CssNode;
	readonly tokens: Token[];
	/** @internal  if() placeholder → original if(…) expression */
	readonly _rawIf?: Record<string, string>;
}

export interface CalcEvaluationContext {
	propertyValues: Record<string, string | Equation | undefined>;
	/** Prevents baking known literals in browsers. */
	skipBaking?: boolean;
	/** @internal cycle guard */
	resolvingProperties?: Set<string>;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

/** True when `value` is an `Equation` (either value or stylesheet shape). */
export function isCalcEquation(value: unknown): value is Equation {
	return (
		value != null &&
		typeof value === 'object' &&
		'ast' in value &&
		'tokens' in value
	);
}

/**
 * True when `value` is an `Equation` whose `ast` is a `DeclarationList` —
 * i.e. the result of parsing a stylesheet block rather than a single value.
 */
export function isCssStylesheet(
	value: unknown,
): value is Equation & { ast: DeclarationList } {
	return (
		isCalcEquation(value) && (value as Equation).ast.type === 'DeclarationList'
	);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function gen(ast: CssNode): string {
	return csstree.generate(ast);
}

function restoreRawIf(
	str: string,
	rawIf: Record<string, string> | undefined,
): string {
	if (!rawIf) return str;
	let s = str;
	for (const [key, val] of Object.entries(rawIf)) {
		s = s.replace(`var(${key})`, val);
	}
	return s;
}

// ─── printEquation ────────────────────────────────────────────────────────────

export function printEquation(equation: Equation): string {
	if (isCssStylesheet(equation)) {
		throw new TypeError(
			`printEquation: expected a CSS value but received a stylesheet block. ` +
				`Use printStylesheet() to render stylesheet blocks.`,
		);
	}
	return restoreRawIf(gen(equation.ast), equation._rawIf);
}

// ─── printStylesheet ─────────────────────────────────────────────────────────

/**
 * Renders a stylesheet `Equation` (one whose `ast` is a `DeclarationList`)
 * to a formatted CSS string, baking declaration values with the given context.
 */
export function printStylesheet(
	eq: Equation,
	context: CalcEvaluationContext = { propertyValues: {} },
): string {
	if (!isCssStylesheet(eq)) {
		throw new TypeError(
			'printStylesheet: expected a stylesheet Equation (DeclarationList ast)',
		);
	}
	const rawIf = eq._rawIf ?? {};
	return formatDeclListChildren(
		[...(eq.ast as DeclarationList).children],
		context,
		rawIf,
		'',
	);
}

function formatDeclListChildren(
	nodes: CssNode[],
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
	indent: string,
): string {
	return nodes
		.map((node) => formatNode(node, ctx, rawIf, indent))
		.filter(Boolean)
		.join('\n');
}

function formatNode(
	node: CssNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
	indent: string,
): string {
	if (node.type === 'Declaration') {
		const decl = node as csstree.Declaration;
		const valueEq: Equation = { ast: decl.value, tokens: [], _rawIf: rawIf };
		const baked = computeEquation(valueEq, ctx);
		return `${indent}${decl.property}: ${printComputationResult(baked)};`;
	}
	if (node.type === 'Rule') {
		const rule = node as csstree.Rule;
		const scope = gen(rule.prelude).trim();
		const children = [...rule.block.children];
		const inner = formatDeclListChildren(children, ctx, rawIf, indent + '  ');
		return `${indent}${scope} {\n${inner}\n${indent}}`;
	}
	if (node.type === 'Atrule') {
		const atrule = node as csstree.Atrule;
		const scope = `@${atrule.name}${atrule.prelude ? ' ' + gen(atrule.prelude) : ''}`;
		if (atrule.block) {
			const children = [...atrule.block.children];
			const inner = formatDeclListChildren(children, ctx, rawIf, indent + '  ');
			return `${indent}${scope} {\n${inner}\n${indent}}`;
		}
		return `${indent}${scope};`;
	}
	return '';
}

// ─── computeEquation ─────────────────────────────────────────────────────────

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

export function computeEquation(
	equation: Equation,
	userContext: CalcEvaluationContext = { propertyValues: {} },
): ComputationResult {
	if (isCssStylesheet(equation)) {
		throw new TypeError(
			`computeEquation: expected a CSS value but received a stylesheet block. ` +
				`Use printStylesheet() to render stylesheet blocks.`,
		);
	}

	const context: CalcEvaluationContext = {
		propertyValues: userContext.propertyValues,
		skipBaking: userContext.skipBaking ?? typeof window !== 'undefined',
		resolvingProperties: userContext.resolvingProperties ?? new Set(),
	};

	const rawIf = equation._rawIf ?? {};

	// Clone and bake the AST in-place via css-tree walk transformations.
	const bakedAst = csstree.clone(equation.ast);
	bakeValue(bakedAst, context, rawIf);

	// Restore if() placeholders in the generated string.
	const generated = restoreRawIf(gen(bakedAst), rawIf);

	// Inspect the baked AST to determine the result type.
	return inferResult(bakedAst, generated);
}

// ─── bakeValue — CSSTree AST walk-based baking ───────────────────────────────

type Replacement = {
	item: ListItem<CssNode>;
	list: List<CssNode>;
	nodes: CssNode[];
};

/**
 * Mutates `ast` in-place via two passes:
 *  1. Replace `var(--prop)` nodes whose values are known in `context`.
 *  2. Evaluate `calc(…)` and math function nodes where all operands are known.
 *
 * `if(…)` placeholder vars (`var(--arbor-if-N)`) are evaluated via
 * `evaluateIfString` and replaced with the result (or kept if undetermined).
 */
function bakeValue(
	ast: CssNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): void {
	if (ctx.skipBaking) return;

	// ── Pass 1: var() substitution ────────────────────────────────────────────
	const varSubs: Replacement[] = [];

	csstree.walk(ast, {
		visit: 'Function',
		leave(node: FunctionNode, item: ListItem<CssNode>, list: List<CssNode>) {
			if (node.name !== 'var' || !item || !list) return;

			const propNode = [...node.children].find(
				(n): n is csstree.Identifier => n.type === 'Identifier',
			);
			if (!propNode) return;
			const propName = propNode.name;
			const fallbackStr = getVarFallback(node);

			// if() placeholder
			if (rawIf[propName] !== undefined) {
				const result = evaluateIfString(rawIf[propName], ctx, rawIf);
				if (!result.startsWith('if(')) {
					// Fully evaluated — replace with the baked result.
					const repAst = csstree.parse(result, {
						context: 'value',
					}) as csstree.Value;
					bakeValue(repAst, ctx, rawIf);
					varSubs.push({ item, list, nodes: [...repAst.children] });
				}
				// Partially/unevaluated — leave the var(--arbor-if-N) node so
				// printEquation can restore the if() string.
				return;
			}

			// Cycle guard
			if (ctx.resolvingProperties?.has(propName)) {
				if (fallbackStr) {
					const fbAst = csstree.parse(fallbackStr, {
						context: 'value',
					}) as csstree.Value;
					bakeValue(fbAst, addResolvingProp(ctx, propName), rawIf);
					varSubs.push({ item, list, nodes: [...fbAst.children] });
				}
				return;
			}

			const known = ctx.propertyValues[propName];
			if (known === undefined) {
				// Unknown — bake the fallback inline (if any) but keep the var().
				if (fallbackStr) {
					const fbAst = csstree.parse(fallbackStr, {
						context: 'value',
					}) as csstree.Value;
					bakeValue(fbAst, addResolvingProp(ctx, propName), rawIf);
					const bakedFb = gen(fbAst);
					if (bakedFb !== fallbackStr) {
						// Rebuild the var() with the baked fallback.
						const newVar = csstree.parse(`var(${propName}, ${bakedFb})`, {
							context: 'value',
						}) as csstree.Value;
						varSubs.push({ item, list, nodes: [...newVar.children] });
					}
				}
				return;
			}

			// Known value
			const knownStr = knownValueToString(propName, known, ctx);
			if (!knownStr) return;

			const repAst = csstree.parse(knownStr, {
				context: 'value',
				parseCustomProperty: true,
			}) as csstree.Value;
			bakeValue(repAst, addResolvingProp(ctx, propName), rawIf);
			varSubs.push({ item, list, nodes: [...repAst.children] });
		},
	} as any);

	// Apply var() substitutions.
	for (const { item, list, nodes } of varSubs) {
		const tmp = new csstree.List<CssNode>();
		nodes.forEach((n) => tmp.appendData(csstree.clone(n)));
		(list as any).insertList(tmp, item);
		list.remove(item);
	}

	// ── Pass 2: calc() / math function simplification ─────────────────────────
	const calcSubs: {
		item: ListItem<CssNode>;
		list: List<CssNode>;
		node: CssNode;
	}[] = [];

	csstree.walk(ast, {
		visit: 'Function',
		leave(node: FunctionNode, item: ListItem<CssNode>, list: List<CssNode>) {
			if (!item || !list) return;
			if (node.name === 'var') return;
			if (!CSS_MATH_FUNCTIONS.has(node.name)) return;
			const simplified = trySimplifyFn(node, ctx, rawIf);
			if (simplified) calcSubs.push({ item, list, node: simplified });
		},
	} as any);

	for (const { item, list, node } of calcSubs) {
		list.insertData(node, item);
		list.remove(item);
	}
}

// ─── AST inspection utilities ─────────────────────────────────────────────────

function getVarFallback(fn: FunctionNode): string | undefined {
	const children = [...fn.children];
	const ci = children.findIndex(
		(n) => n.type === 'Operator' && (n as csstree.Operator).value === ',',
	);
	if (ci === -1) return undefined;
	return children
		.slice(ci + 1)
		.map(gen)
		.join('')
		.trim();
}

function knownValueToString(
	propName: string,
	value: string | Equation | undefined,
	ctx: CalcEvaluationContext,
): string | null {
	if (isToken(value)) throw new Error(`Unexpected token for ${propName}`);
	if (value === undefined) return null;
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	if (isCalcEquation(value)) {
		if (ctx.resolvingProperties?.has(propName)) return `var(${propName})`;
		const newCtx = addResolvingProp(ctx, propName);
		return printComputationResult(computeEquation(value, newCtx));
	}
	return null;
}

function addResolvingProp(
	ctx: CalcEvaluationContext,
	prop: string,
): CalcEvaluationContext {
	return {
		...ctx,
		resolvingProperties: new Set([...(ctx.resolvingProperties ?? []), prop]),
	};
}

// ─── Arithmetic helpers ───────────────────────────────────────────────────────

function trySimplifyFn(
	fn: FunctionNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): CssNode | null {
	if (fn.name === 'calc') return trySimplifyCalc(fn, ctx, rawIf);
	return trySimplifyMathFn(fn, ctx, rawIf);
}

function trySimplifyCalc(
	fn: FunctionNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): CssNode | null {
	const nodes = [...fn.children].filter((n) => n.type !== 'WhiteSpace');
	if (nodes.length === 0) return null;
	if (nodes.length === 1) {
		const r = computeAstNode(nodes[0], ctx, rawIf);
		return resultToNode(r);
	}
	const r = computeArithSeq(nodes, ctx, rawIf);
	return resultToNode(r);
}

function trySimplifyMathFn(
	fn: FunctionNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): CssNode | null {
	// Parse comma-separated args.
	const argGroups: CssNode[][] = [[]];
	for (const n of fn.children) {
		if (n.type === 'Operator' && (n as csstree.Operator).value === ',') {
			argGroups.push([]);
		} else {
			argGroups[argGroups.length - 1].push(n);
		}
	}
	const args = argGroups.map((g) => {
		const f = g.filter((n) => n.type !== 'WhiteSpace');
		if (f.length === 1) return computeAstNode(f[0], ctx, rawIf);
		if (f.length === 0) return { type: 'calc', value: '' } as ComputationResult;
		const tmpList = new csstree.List<CssNode>();
		f.forEach((n) => tmpList.appendData(n));
		return computeArithSeq(f, ctx, rawIf);
	});
	const r = fnCall(fn.name, ...args);
	return resultToNode(r);
}

function computeAstNode(
	node: CssNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	switch (node.type) {
		case 'Dimension': {
			const d = node as csstree.Dimension;
			return { type: 'numeric', value: parseFloat(d.value), unit: d.unit };
		}
		case 'Number': {
			const n = node as NumberNode;
			return { type: 'numeric', value: parseFloat(n.value), unit: '' };
		}
		case 'Percentage': {
			const p = node as csstree.Percentage;
			return { type: 'numeric', value: parseFloat(p.value), unit: '%' };
		}
		case 'Identifier': {
			const id = node as csstree.Identifier;
			if (id.name === 'PI')
				return { type: 'numeric', value: Math.PI, unit: '' };
			return { type: 'calc', value: id.name };
		}
		case 'Function': {
			const fn = node as FunctionNode;
			if (fn.name === 'var') {
				// Already replaced in pass 1 — keep as-is.
				return { type: 'calc', value: gen(fn) };
			}
			if (CSS_MATH_FUNCTIONS.has(fn.name)) {
				const r = trySimplifyFn(fn, ctx, rawIf);
				if (r) return nodeToResult(r);
			}
			return { type: 'calc', value: gen(fn) };
		}
		case 'Parentheses': {
			const inner = [...(node as csstree.Parentheses).children].filter(
				(n) => n.type !== 'WhiteSpace',
			);
			if (inner.length === 1) return computeAstNode(inner[0], ctx, rawIf);
			return computeArithSeq(inner, ctx, rawIf);
		}
		default:
			return { type: 'calc', value: gen(node) };
	}
}

function computeArithSeq(
	nodes: CssNode[],
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	const operands: CssNode[] = [];
	const operators: string[] = [];
	for (const n of nodes) {
		if (n.type === 'Operator')
			operators.push((n as csstree.Operator).value.trim());
		else operands.push(n);
	}
	if (operands.length === 0) return { type: 'calc', value: '' };
	if (operators.length !== operands.length - 1) {
		return { type: 'calc', value: nodes.map(gen).join('') };
	}

	const vals = operands.map((n) => computeAstNode(n, ctx, rawIf));
	const ops = [...operators];

	// Evaluate * and / first.
	let i = 0;
	while (i < ops.length) {
		if (ops[i] === '*') {
			vals.splice(i, 2, multiply(vals[i], vals[i + 1]));
			ops.splice(i, 1);
		} else if (ops[i] === '/') {
			vals.splice(i, 2, divide(vals[i], vals[i + 1]));
			ops.splice(i, 1);
		} else i++;
	}

	// Then + and -.
	let acc = vals[0];
	for (let j = 0; j < ops.length; j++) {
		if (ops[j] === '+') acc = add(acc, vals[j + 1]);
		else if (ops[j] === '-') acc = subtract(acc, vals[j + 1]);
		else
			acc = {
				type: 'calc',
				value: `${printComputationResult(acc)} ${ops[j]} ${printComputationResult(vals[j + 1])}`,
			};
	}
	return acc;
}

function resultToNode(r: ComputationResult): CssNode | null {
	if (r.type === 'numeric') {
		const v = fmtNum(r.value);
		if (r.unit === '%')
			return { type: 'Percentage', value: v } as csstree.Percentage;
		if (r.unit === '') return { type: 'Number', value: v } as NumberNode;
		return { type: 'Dimension', value: v, unit: r.unit } as csstree.Dimension;
	}
	// Non-numeric: only replace if it's genuinely simpler than the original.
	if (r.type === 'calc' && !r.value.startsWith('calc(')) {
		try {
			const repAst = csstree.parse(r.value, {
				context: 'value',
			}) as csstree.Value;
			const children = [...repAst.children].filter(
				(n) => n.type !== 'WhiteSpace',
			);
			if (children.length === 1) return children[0];
		} catch {
			/* ignore */
		}
	}
	return null;
}

function nodeToResult(n: CssNode): ComputationResult {
	if (n.type === 'Dimension')
		return {
			type: 'numeric',
			value: parseFloat((n as csstree.Dimension).value),
			unit: (n as csstree.Dimension).unit,
		};
	if (n.type === 'Number')
		return {
			type: 'numeric',
			value: parseFloat((n as NumberNode).value),
			unit: '',
		};
	if (n.type === 'Percentage')
		return {
			type: 'numeric',
			value: parseFloat((n as csstree.Percentage).value),
			unit: '%',
		};
	return { type: 'calc', value: gen(n) };
}

function fmtNum(v: number): string {
	return String(Math.round(v * 1e10) / 1e10);
}

// ─── Arithmetic helpers (ComputationResult level) ─────────────────────────────

function add(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} + ${printComputationResult(b)}`,
		};
	}
	const an = a as NumericComputationResult,
		bn = b as NumericComputationResult;
	if (a.type === 'numeric' && an.value === 0) return b;
	if (b.type === 'numeric' && bn.value === 0) return a;
	if (a.type !== 'numeric' || b.type !== 'numeric' || an.unit !== bn.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} + ${printComputationResult(b)})`,
		};
	}
	return { type: 'numeric', value: an.value + bn.value, unit: an.unit };
}

function subtract(
	a: ComputationResult,
	b: ComputationResult,
): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} - ${printComputationResult(b)}`,
		};
	}
	const an = a as NumericComputationResult,
		bn = b as NumericComputationResult;
	if (b.type === 'numeric' && bn.value === 0) return a;
	if (a.type === 'numeric' && an.value === 0 && b.type === 'numeric') {
		return { type: 'numeric', value: -bn.value, unit: bn.unit };
	}
	if (a.type !== 'numeric' || b.type !== 'numeric' || an.unit !== bn.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} - ${printComputationResult(b)})`,
		};
	}
	return { type: 'numeric', value: an.value - bn.value, unit: an.unit };
}

function multiply(
	a: ComputationResult,
	b: ComputationResult,
): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} * ${printComputationResult(b)}`,
		};
	}
	const an = a as NumericComputationResult,
		bn = b as NumericComputationResult;
	if (a.type === 'numeric' && an.value === 0)
		return { type: 'numeric', value: 0, unit: an.unit };
	if (b.type === 'numeric' && bn.value === 0)
		return { type: 'numeric', value: 0, unit: bn.unit };
	if (a.type === 'numeric' && b.type === 'numeric') {
		if (an.unit === '')
			return { type: 'numeric', value: bn.value * an.value, unit: bn.unit };
		if (bn.unit === '')
			return { type: 'numeric', value: an.value * bn.value, unit: an.unit };
		if (an.unit === '' && an.value === 1) return b;
		if (bn.unit === '' && bn.value === 1) return a;
		if (an.unit === '%' && an.value === 100)
			return { type: 'numeric', value: bn.value * 100, unit: '%' };
		if (bn.unit === '%' && bn.value === 100)
			return { type: 'numeric', value: an.value * 100, unit: '%' };
		if (an.unit === bn.unit) {
			if (an.unit === '%')
				return {
					type: 'numeric',
					value: (an.value * bn.value) / 100,
					unit: '%',
				};
			return { type: 'numeric', value: an.value * bn.value, unit: an.unit };
		}
	}
	return {
		type: 'calc',
		value: `calc(${printComputationResult(a)} * ${printComputationResult(b)})`,
	};
}

function divide(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} / ${printComputationResult(b)}`,
		};
	}
	const an = a as NumericComputationResult,
		bn = b as NumericComputationResult;
	if (b.type === 'numeric' && bn.value === 0)
		throw new Error('Division by zero');
	if (a.type === 'numeric' && an.value === 0)
		return { type: 'numeric', value: 0, unit: an.unit };
	if (b.type === 'numeric' && bn.value === 1 && bn.unit === '') return a;
	if (b.type === 'numeric' && bn.unit === '' && a.type === 'numeric') {
		return { type: 'numeric', value: an.value / bn.value, unit: an.unit };
	}
	if (a.type === 'numeric' && b.type === 'numeric' && an.unit === bn.unit) {
		return { type: 'numeric', value: an.value / bn.value, unit: '' };
	}
	return {
		type: 'calc',
		value: `calc(${printComputationResult(a)} / ${printComputationResult(b)})`,
	};
}

function fnCall(name: string, ...args: ComputationResult[]): ComputationResult {
	if (args.every((a) => a.type === 'numeric')) {
		const resolver = functionResolvers[name];
		if (resolver) return resolver(...(args as NumericComputationResult[]));
	}
	const isCat = args.some((a) => a.type === 'concatenated');
	const printed = args.map(printComputationResult).join(', ');
	return isCat ?
			{ type: 'concatenated', value: `${name}(${printed})` }
		:	{ type: 'calc', value: `${name}(${printed})` };
}

// ─── if() evaluation ──────────────────────────────────────────────────────────

function evaluateIfString(
	ifExpr: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): string {
	if (ctx.skipBaking) return ifExpr;
	if (!ifExpr.startsWith('if(') || !ifExpr.endsWith(')')) return ifExpr;
	const content = ifExpr.slice(3, -1);
	const clauses = splitIfClauses(content);

	let hasUnknown = false;
	const partial: string[] = [];

	for (const clause of clauses) {
		if (clause.isElse) {
			const v = printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
			if (!hasUnknown) return v;
			partial.push(`else: ${v};`);
			break;
		}
		const dec = evalStyleCondition(clause.condition, ctx);
		if (dec === true) {
			return printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
		} else if (dec === false) {
			// skip
		} else {
			hasUnknown = true;
			const v = printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
			partial.push(`${clause.condition}: ${v};`);
		}
	}

	if (!hasUnknown && partial.length === 0) return ifExpr;
	return `if(${partial.join(' ')})`;
}

function computeEquationStringRaw(
	str: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	if (!str) return { type: 'calc', value: '' };
	const ast = csstree.parse(str, {
		context: 'value',
		parseCustomProperty: true,
	}) as CssNode;
	bakeValue(ast, ctx, rawIf);
	return inferResult(ast, restoreRawIf(gen(ast), rawIf));
}

function splitIfClauses(
	content: string,
): { condition: string; value: string; isElse: boolean }[] {
	const clauses: { condition: string; value: string; isElse: boolean }[] = [];
	let depth = 0,
		start = 0;
	for (let i = 0; i <= content.length; i++) {
		const ch = content[i];
		if (ch === '(' || ch === '[') depth++;
		else if (ch === ')' || ch === ']') depth--;
		else if ((ch === ';' || i === content.length) && depth === 0) {
			const s = content.slice(start, i).trim();
			start = i + 1;
			if (!s) continue;
			let ci = -1,
				d = 0;
			for (let j = 0; j < s.length; j++) {
				if (s[j] === '(' || s[j] === '[') d++;
				else if (s[j] === ')' || s[j] === ']') d--;
				else if (s[j] === ':' && d === 0) {
					ci = j;
					break;
				}
			}
			if (ci === -1) continue;
			const cond = s.slice(0, ci).trim();
			const val = s.slice(ci + 1).trim();
			clauses.push({ condition: cond, value: val, isElse: cond === 'else' });
		}
	}
	return clauses;
}

function evalStyleCondition(
	condStr: string,
	ctx: CalcEvaluationContext,
): boolean | null {
	if (!condStr.startsWith('style(') || !condStr.endsWith(')')) return null;
	const inner = condStr.slice(6, -1);
	let ci = -1,
		d = 0;
	for (let i = 0; i < inner.length; i++) {
		if (inner[i] === '(') d++;
		else if (inner[i] === ')') d--;
		else if (inner[i] === ':' && d === 0) {
			ci = i;
			break;
		}
	}
	if (ci === -1) return null;
	const prop = inner.slice(0, ci).trim();
	const expected = inner.slice(ci + 1).trim();
	if (!prop.startsWith('--') || ctx.skipBaking) return null;
	const actual = ctx.propertyValues[prop];
	if (actual === undefined) return null;
	const actualStr =
		typeof actual === 'string' ? actual
		: typeof actual === 'number' ? String(actual)
		: null;
	if (!actualStr) return null;
	return actualStr.trim() === expected;
}

// ─── inferResult ──────────────────────────────────────────────────────────────

function inferResult(ast: CssNode, generated: string): ComputationResult {
	if (ast.type !== 'Value') {
		// Direct non-Value node (unlikely but handle gracefully)
		return nodeToResult(ast);
	}
	const value = ast as csstree.Value;
	const children = [...value.children].filter((n) => n.type !== 'WhiteSpace');

	if (children.length === 1) {
		const child = children[0];
		if (child.type === 'Dimension')
			return {
				type: 'numeric',
				value: parseFloat((child as csstree.Dimension).value),
				unit: (child as csstree.Dimension).unit,
			};
		if (child.type === 'Number')
			return {
				type: 'numeric',
				value: parseFloat((child as NumberNode).value),
				unit: '',
			};
		if (child.type === 'Percentage')
			return {
				type: 'numeric',
				value: parseFloat((child as csstree.Percentage).value),
				unit: '%',
			};
		if (child.type === 'Parentheses') {
			const inner = [...(child as csstree.Parentheses).children].filter(
				(n) => n.type !== 'WhiteSpace',
			);
			if (inner.length === 1) return nodeToResult(inner[0]);
		}
	}

	// Multiple children with no arithmetic operators → concatenated
	if (children.length > 1 && !children.some((n) => n.type === 'Operator')) {
		return { type: 'concatenated', value: generated };
	}

	// Try extracting a simple literal from a calc() wrapper.
	const extracted = extractLiteralFromSimpleCalc(generated);
	if (extracted !== generated) {
		const n = parseLiteralToNumeric(extracted);
		if (n) return n;
		return { type: 'calc', value: extracted };
	}

	return { type: 'calc', value: generated };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function extractLiteralFromSimpleCalc(value: string): string {
	const m = value.trim().match(/^calc\((.+)\)$/);
	if (m) {
		let inner = m[1].trim();
		while (inner.startsWith('(') && inner.endsWith(')'))
			inner = inner.slice(1, -1).trim();
		if (
			!/[+*/]/.test(inner) &&
			!inner.match(/\.-\d/) &&
			!inner.match(/\d+\(/) &&
			!inner.match(/\s/)
		) {
			return inner;
		}
	}
	return value;
}

function parseLiteralToNumeric(s: string): ComputationResult | null {
	if (s.endsWith('%')) {
		const n = Number(s.slice(0, -1));
		if (!isNaN(n)) return { type: 'numeric', value: n, unit: '%' };
	}
	const m = s.match(/^(-?\d*\.?\d+)([a-zA-Z]*)$/);
	if (m) {
		const n = Number(m[1]);
		if (!isNaN(n)) return { type: 'numeric', value: n, unit: m[2] };
	}
	return null;
}

export function printComputationResult(result: ComputationResult): string {
	if (result.type === 'numeric')
		return `${fmtNum(result.value)}${result.unit}`.trim();
	if (result.type === 'concatenated') return result.value;
	return extractLiteralFromSimpleCalc(result.value.trim());
}
