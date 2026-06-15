/**
 * @file calcTree.ts
 * CSS value representation built on css-tree.
 *
 * `Equation` is a thin wrapper around a css-tree Value AST node paired with
 * token-tracking metadata. The preserved `source` string is used for faithful
 * round-trip printing; the AST is used for semantic operations (baking).
 */

import { isToken, Token } from '@arbor-css/tokens';
import type {
	FunctionNode as CssFunction,
	CssNode,
	List as CssTreeList,
	ListItem,
	NumberNode,
	StringNode,
} from 'css-tree';
import * as csstree from 'css-tree';
import { functionResolvers } from './functions.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalcEvaluationContext {
	propertyValues: Record<string, string | Equation | undefined>;
	/** Prevents the baking of known literals into calculations. */
	skipBaking?: boolean;
	/** @internal Tracks nested property evaluation to prevent cycles. */
	resolvingProperties?: Set<string>;
}

/**
 * A CSS value expression backed by a css-tree AST.
 * - `source`: preserved original CSS string, used by `printEquation`
 * - `ast`: css-tree AST node, used for semantic evaluation
 * - `tokens`: all `Token` objects referenced in this expression
 * - `_rawIf`: map of `--arbor-if-N` → original `if(…)` expression
 * - `_isConcatenated`: true when the expression is a space-separated
 *   multi-value built with `$.concat` or `css\`${a} ${b}\``
 */
export interface Equation {
	readonly source: string;
	readonly ast: CssNode;
	readonly tokens: Token[];
	readonly _rawIf?: Record<string, string>;
	readonly _isConcatenated?: boolean;
}

export function isCalcEquation(value: any): value is Equation {
	return (
		value &&
		typeof value === 'object' &&
		'source' in value &&
		'ast' in value &&
		'tokens' in value &&
		!isCssStylesheet(value)
	);
}

// ─── Stylesheet types ─────────────────────────────────────────────────────────

export interface CssDeclaration {
	type: 'declaration';
	property: string;
	value: Equation;
}

export interface CssBlock {
	type: 'block';
	scope: string;
	children: CssStylesheetNode[];
}

export interface CssFragment {
	type: 'fragment';
	children: CssStylesheetNode[];
}

export type CssStylesheetNode = CssDeclaration | CssBlock | CssFragment;

export interface CssStylesheet {
	type: 'stylesheet';
	children: CssStylesheetNode[];
}

export function isCssStylesheet(value: any): value is CssStylesheet {
	return (
		value &&
		typeof value === 'object' &&
		'type' in value &&
		value.type === 'stylesheet'
	);
}

// ─── ComputationResult ────────────────────────────────────────────────────────

export type NumericComputationResult = {
	type: 'numeric';
	value: number;
	unit: '%' | string;
};
export type ComputationResult =
	| NumericComputationResult
	| { type: 'calc'; value: string }
	| { type: 'concatenated'; value: string };

// ─── Internal helpers ─────────────────────────────────────────────────────────

function formatNumericValue(value: number): string {
	const rounded = Math.round(value * 1e10) / 1e10;
	return String(rounded);
}

// ─── printEquation ────────────────────────────────────────────────────────────

export function printEquation(equation: Equation): string {
	if (isCssStylesheet(equation as any)) {
		const preview = JSON.stringify(equation).slice(0, 80);
		throw new TypeError(
			`printEquation: expected a CSS value, but received a stylesheet block. ` +
				`Use printStylesheet() to render stylesheet blocks. Got: '${preview}'`,
		);
	}
	let source = equation.source;
	if (equation._rawIf) {
		for (const [key, val] of Object.entries(equation._rawIf)) {
			source = source.replace(`var(${key})`, val);
		}
	}
	return source;
}

// ─── Stylesheet printing ──────────────────────────────────────────────────────

function printStylesheetNode(
	node: CssStylesheetNode,
	context: CalcEvaluationContext,
	indent: string,
): string {
	if (node.type === 'declaration') {
		const computed = computeEquation(node.value, context);
		const value = printComputationResult(computed);
		return `${indent}${node.property}: ${value};`;
	}
	if (node.type === 'block') {
		const inner = node.children
			.map((child) => printStylesheetNode(child, context, indent + '  '))
			.join('\n');
		return `${indent}${node.scope} {\n${inner}\n${indent}}`;
	}
	if (node.type === 'fragment') {
		return node.children
			.map((child) => printStylesheetNode(child, context, indent))
			.join('\n');
	}
	throw new Error(`Unknown stylesheet node type: ${(node as any).type}`);
}

export function printStylesheet(
	stylesheet: CssStylesheet,
	context: CalcEvaluationContext = { propertyValues: {} },
): string {
	return stylesheet.children
		.map((node) => printStylesheetNode(node, context, ''))
		.join('\n');
}

// ─── if() parsing and evaluation ─────────────────────────────────────────────

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

function isArithmeticOperator(op: string): boolean {
	const t = op.trim();
	return t === '+' || t === '-' || t === '*' || t === '/';
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

function splitIfClauses(
	content: string,
): { condition: string; value: string; isElse: boolean }[] {
	const clauses: { condition: string; value: string; isElse: boolean }[] = [];
	let depth = 0;
	let clauseStart = 0;

	for (let i = 0; i <= content.length; i++) {
		const ch = content[i];
		if (ch === '(' || ch === '[') depth++;
		else if (ch === ')' || ch === ']') depth--;
		else if ((ch === ';' || i === content.length) && depth === 0) {
			const clauseStr = content.slice(clauseStart, i).trim();
			clauseStart = i + 1;
			if (!clauseStr) continue;

			let colIdx = -1;
			let d = 0;
			for (let j = 0; j < clauseStr.length; j++) {
				if (clauseStr[j] === '(' || clauseStr[j] === '[') d++;
				else if (clauseStr[j] === ')' || clauseStr[j] === ']') d--;
				else if (clauseStr[j] === ':' && d === 0) {
					colIdx = j;
					break;
				}
			}
			if (colIdx === -1) continue;
			const condition = clauseStr.slice(0, colIdx).trim();
			const value = clauseStr.slice(colIdx + 1).trim();
			clauses.push({ condition, value, isElse: condition === 'else' });
		}
	}
	return clauses;
}

function evaluateStyleConditionString(
	condStr: string,
	ctx: CalcEvaluationContext,
): boolean | null {
	if (!condStr.startsWith('style(') || !condStr.endsWith(')')) return null;
	const content = condStr.slice(6, -1);

	let colIdx = -1;
	let depth = 0;
	for (let i = 0; i < content.length; i++) {
		if (content[i] === '(') depth++;
		else if (content[i] === ')') depth--;
		else if (content[i] === ':' && depth === 0) {
			colIdx = i;
			break;
		}
	}
	if (colIdx === -1) return null;

	const propName = content.slice(0, colIdx).trim();
	const expectedValue = content.slice(colIdx + 1).trim();

	if (!propName.startsWith('--')) return null;
	if (ctx.skipBaking) return null;

	const actualValue = ctx.propertyValues[propName];
	if (actualValue === undefined) return null;

	const actualStr =
		typeof actualValue === 'string' ? actualValue
		: typeof actualValue === 'number' ? String(actualValue)
		: null;
	if (actualStr === null) return null;

	return actualStr.trim() === expectedValue;
}

/** Evaluates an `if(…)` expression (including the outer wrapper) and returns
 *  the baked result, or the (partially simplified) `if(…)` string. */
function evaluateIfString(
	ifExpr: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): string {
	if (ctx.skipBaking) return ifExpr;
	if (!ifExpr.startsWith('if(') || !ifExpr.endsWith(')')) return ifExpr;
	const ifContent = ifExpr.slice(3, -1);

	const clauses = splitIfClauses(ifContent);
	let hasUnknownCondition = false;
	const partialClauses: string[] = [];

	for (const clause of clauses) {
		if (clause.isElse) {
			const bakedVal = printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
			if (!hasUnknownCondition) return bakedVal;
			partialClauses.push(`else: ${bakedVal};`);
			break;
		}
		const decision = evaluateStyleConditionString(clause.condition, ctx);
		if (decision === true) {
			return printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
		} else if (decision === false) {
			// Skip this false branch
		} else {
			hasUnknownCondition = true;
			const bakedVal = printComputationResult(
				computeEquationStringRaw(clause.value, ctx, rawIf),
			);
			partialClauses.push(`${clause.condition}: ${bakedVal};`);
		}
	}

	if (!hasUnknownCondition && partialClauses.length === 0) {
		return `if(${ifContent})`;
	}
	return `if(${partialClauses.join(' ')})`;
}

/** Finds all `if(…)` patterns in a CSS string and evaluates each. */
function evaluateIfExpressionsInString(
	str: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): string {
	let result = str;
	let i = 0;
	while (i < result.length) {
		const idx = result.indexOf('if(', i);
		if (idx === -1) break;
		let depth = 0;
		let end = idx + 3;
		while (end < result.length) {
			if (result[end] === '(') depth++;
			else if (result[end] === ')') {
				if (depth === 0) {
					end++;
					break;
				}
				depth--;
			}
			end++;
		}
		const ifExpr = result.slice(idx, end);
		const evaluated = evaluateIfString(ifExpr, ctx, rawIf);
		result = result.slice(0, idx) + evaluated + result.slice(end);
		i = idx + evaluated.length;
	}
	return result;
}

// ─── AST-based evaluation helpers ─────────────────────────────────────────────

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
	return computeEquationFromAst(ast, ctx, rawIf);
}

function computeEquationFromAst(
	ast: CssNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	switch (ast.type) {
		case 'Value':
			return computeValueNode(ast as csstree.Value, ctx, rawIf);
		case 'Function':
			return computeFunctionNode(ast as CssFunction, ctx, rawIf);
		case 'Dimension': {
			const d = ast as csstree.Dimension;
			return { type: 'numeric', value: parseFloat(d.value), unit: d.unit };
		}
		case 'Number': {
			const n = ast as NumberNode;
			return { type: 'numeric', value: parseFloat(n.value), unit: '' };
		}
		case 'Percentage': {
			const p = ast as csstree.Percentage;
			return { type: 'numeric', value: parseFloat(p.value), unit: '%' };
		}
		case 'Identifier': {
			const id = ast as csstree.Identifier;
			if (id.name === 'PI')
				return { type: 'numeric', value: Math.PI, unit: '' };
			return { type: 'calc', value: id.name };
		}
		case 'Parentheses': {
			const inner: CssNode = {
				type: 'Value',
				children: (ast as any).children,
			} as any;
			return computeValueNode(inner as csstree.Value, ctx, rawIf);
		}
		case 'Raw':
			return computeEquationStringRaw(
				(ast as csstree.Raw).value.trim(),
				ctx,
				rawIf,
			);
		case 'String':
			return { type: 'calc', value: (ast as StringNode).value };
		default:
			return { type: 'calc', value: csstree.generate(ast) };
	}
}

function computeValueNode(
	node: csstree.Value,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	const children = [...node.children].filter((n) => n.type !== 'WhiteSpace');
	if (children.length === 0) return { type: 'calc', value: '' };
	if (children.length === 1)
		return computeEquationFromAst(children[0], ctx, rawIf);

	if (
		children.some(
			(n) =>
				n.type === 'Operator' &&
				isArithmeticOperator((n as csstree.Operator).value),
		)
	) {
		return computeArithmeticChildren(children, ctx, rawIf);
	}

	const parts = children.map((n) =>
		printComputationResult(computeEquationFromAst(n, ctx, rawIf)),
	);
	return { type: 'concatenated', value: parts.join(' ') };
}

function computeFunctionNode(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	if (fn.name === 'var') return computeVarFunction(fn, ctx, rawIf);
	if (fn.name === 'calc') return computeCalcFunction(fn, ctx, rawIf);
	if (CSS_MATH_FUNCTIONS.has(fn.name) && fn.name !== 'calc') {
		return computeMathFunctionNode(fn, ctx, rawIf);
	}
	return { type: 'calc', value: csstree.generate(fn) };
}

function getVarFallbackString(fn: CssFunction): string | undefined {
	const children = [...fn.children];
	const commaIdx = children.findIndex(
		(n) => n.type === 'Operator' && (n as csstree.Operator).value === ',',
	);
	if (commaIdx === -1) return undefined;
	const fallbackNodes = children.slice(commaIdx + 1);
	if (fallbackNodes.length === 0) return undefined;
	return fallbackNodes
		.map((n) => csstree.generate(n))
		.join('')
		.trim();
}

function computeVarFunction(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	const children = [...fn.children];
	const propNameNode = children.find((n) => n.type === 'Identifier') as
		| csstree.Identifier
		| undefined;
	if (!propNameNode) return { type: 'calc', value: csstree.generate(fn) };
	const propName = propNameNode.name;
	const fallback = getVarFallbackString(fn);

	if (rawIf[propName] !== undefined) {
		const ifResult = evaluateIfString(rawIf[propName], ctx, rawIf);
		return { type: 'calc', value: ifResult };
	}

	// loop detected: we are already resolving this property up the chain
	if (ctx.resolvingProperties?.has(propName)) {
		return { type: 'calc', value: `var(${propName})` };
	}

	const knownValue = ctx.propertyValues[propName];
	if (knownValue === undefined || ctx.skipBaking) {
		// The main property reference is not known, so we can't
		// simplify further (even if fallback exists - this allows
		// the runtime property to be utilized). Return the original.
		return { type: 'calc', value: csstree.generate(fn) };
	}

	const knownStr = evaluatePropertyValueToString(propName, knownValue, ctx);
	if (knownStr === undefined)
		return { type: 'calc', value: csstree.generate(fn) };
	const newCtx = addResolvingProp(ctx, propName);
	return computeEquationStringRaw(knownStr, newCtx, rawIf);
}

function evaluatePropertyValueToString(
	propName: string,
	value: string | Equation | undefined,
	ctx: CalcEvaluationContext,
): string | undefined {
	if (isToken(value)) {
		throw new Error(
			`Unexpected token for property ${propName}. Got token: ${(value as any).name}`,
		);
	}
	if (value === undefined) return undefined;
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	if (isCalcEquation(value)) {
		if (ctx.resolvingProperties?.has(propName)) return `var(${propName})`;
		const newCtx = addResolvingProp(ctx, propName);
		return printComputationResult(computeEquation(value as Equation, newCtx));
	}
	return undefined;
}

function computeCalcFunction(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	if (ctx.skipBaking) return { type: 'calc', value: csstree.generate(fn) };
	const children = [...fn.children].filter((n) => n.type !== 'WhiteSpace');
	if (children.length === 0) return { type: 'calc', value: '' };
	if (children.length === 1)
		return computeEquationFromAst(children[0], ctx, rawIf);
	return computeArithmeticChildren(children, ctx, rawIf);
}

function computeArithmeticChildren(
	nodes: CssNode[],
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	const operands: CssNode[] = [];
	const operators: string[] = [];

	for (const node of nodes) {
		if (node.type === 'Operator') {
			operators.push((node as csstree.Operator).value.trim());
		} else {
			operands.push(node);
		}
	}

	if (operands.length === 0) return { type: 'calc', value: '' };
	if (operators.length !== operands.length - 1) {
		return {
			type: 'calc',
			value: nodes.map((n) => csstree.generate(n)).join(''),
		};
	}

	const results = operands.map((n) => computeEquationFromAst(n, ctx, rawIf));
	const ops = [...operators];
	const vals = [...results];

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

function computeMathFunctionNode(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult {
	const args = parseCommaSeparatedFnArgs(fn, ctx, rawIf);
	return fnCall(fn.name, ...args);
}

function parseCommaSeparatedFnArgs(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): ComputationResult[] {
	const children = [...fn.children];
	const argGroups: CssNode[][] = [[]];
	for (const node of children) {
		if (node.type === 'Operator' && (node as csstree.Operator).value === ',') {
			argGroups.push([]);
		} else {
			argGroups[argGroups.length - 1].push(node);
		}
	}
	return argGroups.map((nodes) => {
		const filtered = nodes.filter((n) => n.type !== 'WhiteSpace');
		if (filtered.length === 0)
			return { type: 'calc', value: '' } as ComputationResult;
		if (filtered.length === 1)
			return computeEquationFromAst(filtered[0], ctx, rawIf);
		const tempList = new csstree.List<CssNode>();
		for (const n of filtered) tempList.appendData(n);
		const tempValue: CssNode = { type: 'Value', children: tempList } as any;
		return computeValueNode(tempValue as csstree.Value, ctx, rawIf);
	});
}

// ─── bakeValue — in-place CSSTree AST transformation ─────────────────────────

type Replacement = {
	item: ListItem<CssNode>;
	list: CssTreeList<CssNode>;
	nodes: CssNode[];
};

function bakeValue(
	ast: CssNode,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): void {
	if (ctx.skipBaking) return;

	// Phase 1: var() substitution (skip if() placeholders)
	const varReplacements: Replacement[] = [];

	csstree.walk(ast, {
		visit: 'Function',
		leave(
			node: CssFunction,
			item: ListItem<CssNode>,
			list: CssTreeList<CssNode>,
		) {
			if (node.name !== 'var' || !item || !list) return;

			const propNameNode = [...node.children].find(
				(n) => n.type === 'Identifier',
			) as csstree.Identifier | undefined;
			if (!propNameNode) return;
			const propName = propNameNode.name;
			const fallbackStr = getVarFallbackString(node);

			// Skip if() placeholders — handled after bakeValue
			if (rawIf[propName] !== undefined) return;

			// Cycle guard
			if (ctx.resolvingProperties?.has(propName)) {
				if (fallbackStr) {
					const fbAst = csstree.parse(fallbackStr, {
						context: 'value',
					}) as csstree.Value;
					bakeValue(fbAst, addResolvingProp(ctx, propName), rawIf);
					varReplacements.push({ item, list, nodes: [...fbAst.children] });
				}
				return;
			}

			const knownValue = ctx.propertyValues[propName];
			if (knownValue === undefined) {
				if (fallbackStr) {
					const fbAst = csstree.parse(fallbackStr, {
						context: 'value',
					}) as csstree.Value;
					bakeValue(fbAst, addResolvingProp(ctx, propName), rawIf);
					varReplacements.push({ item, list, nodes: [...fbAst.children] });
				}
				return;
			}

			// Get the string representation WITHOUT calling computeEquation
			// (to avoid exponential recursion)
			let knownStr: string;
			if (typeof knownValue === 'string') knownStr = knownValue;
			else if (typeof knownValue === 'number') knownStr = String(knownValue);
			else if (isCalcEquation(knownValue))
				knownStr = printEquation(knownValue as Equation);
			else return;

			if (!knownStr) return;

			const knownAst = csstree.parse(knownStr, {
				context: 'value',
				parseCustomProperty: true,
			}) as csstree.Value;
			bakeValue(knownAst, addResolvingProp(ctx, propName), rawIf);
			varReplacements.push({ item, list, nodes: [...knownAst.children] });
		},
	} as any);

	for (const { item, list, nodes } of varReplacements) {
		const tempList = new csstree.List<CssNode>();
		for (const n of nodes) tempList.appendData(csstree.clone(n));
		(list as any).insertList(tempList, item);
		list.remove(item);
	}

	// Phase 2: calc() and math function simplification
	const calcReplacements: {
		item: ListItem<CssNode>;
		list: CssTreeList<CssNode>;
		node: CssNode;
	}[] = [];

	csstree.walk(ast, {
		visit: 'Function',
		leave(
			node: CssFunction,
			item: ListItem<CssNode>,
			list: CssTreeList<CssNode>,
		) {
			if (!item || !list) return;
			const result = tryEvalFunctionToNode(node, ctx, rawIf);
			if (result !== null) calcReplacements.push({ item, list, node: result });
		},
	} as any);

	for (const { item, list, node } of calcReplacements) {
		list.insertData(node, item);
		list.remove(item);
	}
}

function tryEvalFunctionToNode(
	fn: CssFunction,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): CssNode | null {
	if (fn.name !== 'calc' && !CSS_MATH_FUNCTIONS.has(fn.name)) return null;
	if (fn.name === 'var') return null;

	let result: ComputationResult;
	if (fn.name === 'calc') result = computeCalcFunction(fn, ctx, rawIf);
	else result = computeMathFunctionNode(fn, ctx, rawIf);

	if (result.type === 'numeric') {
		const { value, unit } = result;
		const vs = formatNumericValue(value);
		if (unit === '%')
			return { type: 'Percentage', value: vs } as csstree.Percentage;
		if (unit === '') return { type: 'Number', value: vs } as NumberNode;
		return { type: 'Dimension', value: vs, unit } as csstree.Dimension;
	}

	if (result.type === 'calc' || result.type === 'concatenated') {
		const resultStr = result.value;
		if (resultStr === csstree.generate(fn)) return null;
		const repAst = csstree.parse(resultStr, {
			context: 'value',
			parseCustomProperty: true,
		}) as csstree.Value;
		const repChildren = [...repAst.children].filter(
			(n) => n.type !== 'WhiteSpace',
		);
		if (repChildren.length === 1) return repChildren[0];
		return null;
	}
	return null;
}

function computeFromBakedAst(
	ast: CssNode,
	isConcatenated: boolean,
): ComputationResult {
	if (ast.type !== 'Value') {
		if (ast.type === 'Dimension')
			return {
				type: 'numeric',
				value: parseFloat((ast as csstree.Dimension).value),
				unit: (ast as csstree.Dimension).unit,
			};
		if (ast.type === 'Number')
			return {
				type: 'numeric',
				value: parseFloat((ast as NumberNode).value),
				unit: '',
			};
		if (ast.type === 'Percentage')
			return {
				type: 'numeric',
				value: parseFloat((ast as csstree.Percentage).value),
				unit: '%',
			};
		return { type: 'calc', value: csstree.generate(ast) };
	}

	const node = ast as csstree.Value;
	const children = [...node.children].filter((n) => n.type !== 'WhiteSpace');
	if (children.length === 0) return { type: 'calc', value: '' };

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
			return computeFromBakedAst(
				{ type: 'Value', children: (child as any).children } as any,
				isConcatenated,
			);
		}
		return { type: 'calc', value: csstree.generate(child) };
	}

	if (isConcatenated) {
		return {
			type: 'concatenated',
			value: children.map((n) => csstree.generate(n)).join(' '),
		};
	}
	return { type: 'calc', value: csstree.generate(node) };
}

// ─── computeEquation ─────────────────────────────────────────────────────────

export function computeEquation(
	equation: Equation,
	userContext: CalcEvaluationContext = { propertyValues: {} },
): ComputationResult {
	if (isCssStylesheet(equation as any)) {
		const preview = JSON.stringify(equation).slice(0, 80);
		throw new TypeError(
			`computeEquation: expected a CSS value, but received a stylesheet block. ` +
				`Use printStylesheet() to render stylesheet blocks. Got: '${preview}'`,
		);
	}

	const context: CalcEvaluationContext = {
		propertyValues: userContext.propertyValues,
		skipBaking: userContext.skipBaking ?? typeof window !== 'undefined',
		resolvingProperties: userContext.resolvingProperties ?? new Set(),
	};

	const rawIf = equation._rawIf ?? {};

	// Start with the source-preserved string (retains original whitespace).
	let str = printEquation(equation);

	if (!context.skipBaking) {
		// Step 1: Evaluate if() expressions (string-based, preserves spacing).
		if (Object.keys(rawIf).length > 0) {
			str = evaluateIfExpressionsInString(str, context, rawIf);
		}

		// Step 2: Substitute var() references (string-based, preserves spacing).
		str = substituteVarsInString(str, context);

		// Step 3: Simplify calc() expressions via CSSTree AST evaluation.
		str = simplifyCalcExpressions(str, context, rawIf);
	}

	// Determine the ComputationResult type from the final string.
	const trimmed = str.trim();
	const extracted = extractLiteralFromSimpleCalc(trimmed);
	const numericResult = parseLiteralToNumeric(extracted);
	if (numericResult) return numericResult;

	if (equation._isConcatenated) return { type: 'concatenated', value: str };

	if (extracted !== trimmed) {
		const n2 = parseLiteralToNumeric(extracted);
		if (n2) return n2;
		return { type: 'calc', value: extracted };
	}

	return { type: 'calc', value: str };
}

// ─── String-based baking helpers ─────────────────────────────────────────────

/**
 * Resolves a single `var(--prop)` expression if the property is known.
 * For var() with fallback, if the property is known, the fallback is
 * discarded. If the property is unknown, the fallback is baked in place
 * and the property reference is retained.
 * Returns the resolved string, or null if unknown.
 */
function tryResolveVarExpr(
	varExpr: string,
	ctx: CalcEvaluationContext,
): string | null {
	// Parse: var(--prop[, fallback])
	const inner = varExpr.slice(4, -1); // between 'var(' and ')'

	let commaIdx = -1;
	let depth = 0;
	for (let k = 0; k < inner.length; k++) {
		if (inner[k] === '(') depth++;
		else if (inner[k] === ')') depth--;
		else if (inner[k] === ',' && depth === 0) {
			commaIdx = k;
			break;
		}
	}

	const propName =
		commaIdx === -1 ? inner.trim() : inner.slice(0, commaIdx).trim();
	const fallback =
		commaIdx === -1 ? undefined : inner.slice(commaIdx + 1).trim();

	if (ctx.resolvingProperties?.has(propName)) {
		// Cycle detected. Like native CSS, we give up. Does NOT use fallback here.
		return null;
	}

	const knownValue = ctx.propertyValues[propName];
	if (knownValue === undefined || ctx.skipBaking) {
		if (fallback !== undefined && !ctx.skipBaking) {
			// Property unknown: preserve the var() but bake the fallback inline
			const bakedFallback = substituteVarsInString(
				fallback,
				addResolvingProp(ctx, propName),
			);
			if (bakedFallback !== fallback) {
				return `var(${propName}, ${bakedFallback})`;
			}
		}
		return null; // keep original var() unchanged
	}

	const knownStr =
		typeof knownValue === 'string' ? knownValue
		: typeof knownValue === 'number' ? String(knownValue)
		: isCalcEquation(knownValue) ? printEquation(knownValue as Equation)
		: null;

	if (knownStr === null) return null;
	return substituteVarsInString(knownStr, addResolvingProp(ctx, propName));
}

/** Replaces all `var(--prop)` occurrences in a CSS string with known values,
 *  preserving surrounding whitespace and operators. */
function substituteVarsInString(
	str: string,
	ctx: CalcEvaluationContext,
): string {
	let result = '';
	let i = 0;

	while (i < str.length) {
		const varStart = str.indexOf('var(', i);
		if (varStart === -1) {
			result += str.slice(i);
			break;
		}
		result += str.slice(i, varStart);

		// Find the matching closing paren for var(
		let depth = 0;
		let j = varStart + 4;
		while (j < str.length) {
			if (str[j] === '(') depth++;
			else if (str[j] === ')') {
				if (depth === 0) {
					j++;
					break;
				}
				depth--;
			}
			j++;
		}

		const varExpr = str.slice(varStart, j);
		const resolved = tryResolveVarExpr(varExpr, ctx);
		result += resolved !== null ? resolved : varExpr;
		i = j;
	}

	return result;
}

/** Parses a CSS value string and simplifies any evaluatable calc() or math
 *  function nodes using targeted string-level replacement, preserving all
 *  surrounding whitespace and separators. */
function simplifyCalcExpressions(
	str: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): string {
	if (ctx.skipBaking) return str;

	// Also try to simplify other math functions
	const mathFnNames = [...CSS_MATH_FUNCTIONS];
	let result = str;

	for (const fnName of mathFnNames) {
		let i = 0;
		while (i < result.length) {
			const fnStart = result.indexOf(`${fnName}(`, i);
			if (fnStart === -1) break;

			// Find the matching closing paren
			let depth = 0;
			let j = fnStart + fnName.length + 1; // after 'name('
			while (j < result.length) {
				if (result[j] === '(') depth++;
				else if (result[j] === ')') {
					if (depth === 0) {
						j++;
						break;
					}
					depth--;
				}
				j++;
			}

			const fnExpr = result.slice(fnStart, j); // e.g. 'calc(2px + 1px)'
			const simplified = trySimplifyMathFnExpr(fnExpr, fnName, ctx, rawIf);
			if (simplified !== null && simplified !== fnExpr) {
				result = result.slice(0, fnStart) + simplified + result.slice(j);
				i = fnStart + simplified.length;
			} else {
				i = fnStart + fnExpr.length;
			}
		}
	}

	return result;
}

function trySimplifyMathFnExpr(
	fnExpr: string,
	fnName: string,
	ctx: CalcEvaluationContext,
	rawIf: Record<string, string>,
): string | null {
	try {
		const ast = csstree.parse(fnExpr, {
			context: 'value',
			parseCustomProperty: true,
		}) as csstree.Value;
		const children = [...ast.children].filter((n) => n.type !== 'WhiteSpace');
		if (children.length !== 1 || children[0].type !== 'Function') return null;
		const fn = children[0] as CssFunction;
		if (fn.name !== fnName) return null;

		let result: ComputationResult;
		if (fn.name === 'calc') result = computeCalcFunction(fn, ctx, rawIf);
		else result = computeMathFunctionNode(fn, ctx, rawIf);

		if (result.type === 'numeric') {
			return `${formatNumericValue(result.value)}${result.unit}`;
		}
		if (
			result.type === 'calc' &&
			result.value !== fnExpr &&
			result.value !== csstree.generate(fn)
		) {
			return result.value;
		}
		return null;
	} catch {
		return null;
	}
}

// ─── Arithmetic helpers ───────────────────────────────────────────────────────

function add(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} + ${printComputationResult(b)}`,
		};
	}
	if (a.value === 0) return b;
	if (b.value === 0) return a;
	const an = a as NumericComputationResult;
	const bn = b as NumericComputationResult;
	if (a.type === 'calc' || b.type === 'calc' || an.unit !== bn.unit) {
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
	const an = a as NumericComputationResult;
	const bn = b as NumericComputationResult;
	if (b.type === 'numeric' && bn.value === 0) return a;
	if (a.type === 'numeric' && an.value === 0 && b.type === 'numeric') {
		return { type: 'numeric', value: -bn.value, unit: bn.unit };
	}
	if (a.type === 'calc' || b.type === 'calc' || an.unit !== bn.unit) {
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
	const an = a as NumericComputationResult;
	const bn = b as NumericComputationResult;
	if (a.type === 'numeric' && an.value === 0)
		return { type: 'numeric', value: 0, unit: an.unit };
	if (b.type === 'numeric' && bn.value === 0)
		return { type: 'numeric', value: 0, unit: bn.unit };
	if (a.type === 'numeric' && b.type === 'numeric' && an.unit === '')
		return { type: 'numeric', value: bn.value * an.value, unit: bn.unit };
	if (a.type === 'numeric' && b.type === 'numeric' && bn.unit === '')
		return { type: 'numeric', value: an.value * bn.value, unit: an.unit };
	if (a.type === 'numeric' && an.unit === '' && an.value === 1) return b;
	if (b.type === 'numeric' && bn.unit === '' && bn.value === 1) return a;
	if (a.type === 'numeric' && an.unit === '%' && an.value === 100) {
		if (b.type !== 'numeric') return b;
		return { type: 'numeric', value: bn.value * 100, unit: '%' };
	}
	if (b.type === 'numeric' && bn.unit === '%' && bn.value === 100) {
		if (a.type !== 'numeric') return a;
		return { type: 'numeric', value: an.value * 100, unit: '%' };
	}
	if (a.type === 'calc' || b.type === 'calc') {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} * ${printComputationResult(b)})`,
		};
	}
	if (an.unit === bn.unit) {
		if (an.unit === '%')
			return { type: 'numeric', value: (an.value * bn.value) / 100, unit: '%' };
		return { type: 'numeric', value: an.value * bn.value, unit: an.unit };
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
	const an = a as NumericComputationResult;
	const bn = b as NumericComputationResult;
	if (b.type === 'numeric' && bn.value === 0)
		throw new Error('Division by zero');
	if (a.type === 'numeric' && an.value === 0)
		return { type: 'numeric', value: 0, unit: an.unit };
	if (b.type === 'numeric' && bn.value === 1 && bn.unit === '') return a;
	if (b.type === 'numeric' && bn.unit === '' && a.type === 'numeric') {
		return { type: 'numeric', value: an.value / bn.value, unit: an.unit };
	}
	if (a.type === 'calc' || b.type === 'calc') {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} / ${printComputationResult(b)})`,
		};
	}
	if (a.type === 'numeric' && b.type === 'numeric') {
		return { type: 'numeric', value: an.value / bn.value, unit: '' };
	}
	return {
		type: 'calc',
		value: `calc(${printComputationResult(a)} / ${printComputationResult(b)})`,
	};
}

function fnCall(name: string, ...args: ComputationResult[]): ComputationResult {
	if (args.every((arg) => arg.type === 'numeric')) {
		const resolver = functionResolvers[name];
		if (resolver) return resolver(...(args as NumericComputationResult[]));
	}
	const isConcatenated = args.some((arg) => arg.type === 'concatenated');
	const printArgs = args.map(printComputationResult);
	if (isConcatenated)
		return { type: 'concatenated', value: `${name}(${printArgs.join(', ')})` };
	return { type: 'calc', value: `${name}(${printArgs.join(', ')})` };
}

// ─── Utility functions ────────────────────────────────────────────────────────

function parseLiteralToNumeric(literal: string): ComputationResult | null {
	if (literal.endsWith('%')) {
		const n = Number(literal.slice(0, -1));
		if (isNaN(n)) return null;
		return { type: 'numeric', value: n, unit: '%' };
	}
	const match = literal.match(/^(-?\d*\.?\d+)([a-zA-Z]*)$/);
	if (!match) return null;
	const n = Number(match[1]);
	if (isNaN(n)) return null;
	return { type: 'numeric', value: n, unit: match[2] };
}

function removeWrappingParens(value: string): string {
	let current = value.trim();
	while (current.startsWith('(') && current.endsWith(')')) {
		current = current.slice(1, -1).trim();
	}
	return current;
}

export function extractLiteralFromSimpleCalc(value: string): string {
	const insideCalc = value.trim().match(/^calc\((.+)\)$/);
	if (insideCalc) {
		const insideValue = removeWrappingParens(insideCalc[1].trim());
		const isComplex =
			insideValue.match(/[+*/]/) ||
			insideValue.match(/.-\d/) ||
			insideValue.match(/\d+\(/) ||
			insideValue.match(/\s/);
		if (!isComplex) return insideValue;
	}
	return value;
}

export function printComputationResult(result: ComputationResult): string {
	if (result.type === 'calc')
		return extractLiteralFromSimpleCalc(result.value.trim());
	if (result.type === 'concatenated') return result.value;
	return `${(result as NumericComputationResult).value}${(result as NumericComputationResult).unit}`.trim();
}
