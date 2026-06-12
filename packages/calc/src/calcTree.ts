import { isToken, Token } from '@arbor-css/tokens';
import { functionResolvers } from './functions.js';

export interface CalcEvaluationContext {
	propertyValues: Record<string, string | Equation | undefined>;
	/** Prevents the baking of known literals into calculations. */
	skipBaking?: boolean;
	/** @internal Tracks nested property evaluation to prevent cycles. */
	resolvingProperties?: Set<string>;
}

export function isCalcEquation(value: any): value is Equation {
	return (
		value && typeof value === 'object' && 'type' in value && 'tokens' in value
	);
}

export type Equation = OperationTree;
export type OperationTree =
	| AddOperation
	| SubtractOperation
	| MultiplyOperation
	| DivideOperation
	| LiteralOperation
	| CastOperation
	| FunctionCallOperation
	| ConcatenateOperation
	| ColorOperation
	| TokenOperation
	| GroupOperation;

export interface BaseOperation {
	// tracks tokens referenced in this node and children.
	// this list at the root node is all the dependencies of the equation
	tokens: Token[];
}

export interface AddOperation extends BaseOperation {
	type: 'add';
	values: Equation[];
}
export interface SubtractOperation extends BaseOperation {
	type: 'subtract';
	values: Equation[];
}
export interface MultiplyOperation extends BaseOperation {
	type: 'multiply';
	values: Equation[];
}
export interface DivideOperation extends BaseOperation {
	type: 'divide';
	values: [Equation, Equation];
}
export interface LiteralOperation extends BaseOperation {
	type: 'literal';
	value: string | number;
}
export interface CastOperation extends BaseOperation {
	type: 'cast';
	value: Equation;
	unit: '%' | '';
}
export interface FunctionCallOperation extends BaseOperation {
	type: 'function';
	name: string;
	args: Equation[];
}
/** Not strictly calc(), but useful for constructing non-numeric outputs... */
export interface ConcatenateOperation extends BaseOperation {
	type: 'concatenate';
	separator: string;
	values: Equation[];
}
export interface ColorOperation extends BaseOperation {
	type: 'color';
	space: string;
	from?: Equation;
	parts: Equation[];
	opacity?: Equation;
}
export interface TokenOperation extends BaseOperation {
	type: 'token';
	value: Token;
	fallback?: Equation;
}
/**
 * Wraps in parentheses.
 */
export interface GroupOperation extends BaseOperation {
	type: 'group';
	value: Equation;
}

export const $ = {
	val: (value: string | number): LiteralOperation => {
		if (typeof value === 'string' || typeof value === 'number') {
			return { type: 'literal', value, tokens: [] };
		}
		return { type: 'literal', value, tokens: [] };
	},
	token: (value: Token, fallback?: Equation): TokenOperation => {
		return {
			type: 'token',
			value,
			fallback,
			tokens: fallback ? [value, ...fallback.tokens] : [value],
		};
	},
	add: (...values: Equation[]): AddOperation => {
		return { type: 'add', values, tokens: values.flatMap((v) => v.tokens) };
	},
	subtract: (...values: Equation[]): SubtractOperation => {
		return {
			type: 'subtract',
			values,
			tokens: values.flatMap((v) => v.tokens),
		};
	},
	multiply: (...values: Equation[]): MultiplyOperation => {
		return {
			type: 'multiply',
			values,
			tokens: values.flatMap((v) => v.tokens),
		};
	},
	divide: (numerator: Equation, denominator: Equation): DivideOperation => {
		return {
			type: 'divide',
			values: [numerator, denominator],
			tokens: [numerator, denominator].flatMap((v) => v.tokens),
		};
	},
	castPercentage: (value: Equation): Equation => {
		return { type: 'cast', value, unit: '%', tokens: value.tokens };
	},
	fn: (name: string, ...args: Equation[]): FunctionCallOperation => {
		return {
			type: 'function',
			name,
			args,
			tokens: args.flatMap((v) => v.tokens),
		};
	},
	concat: (values: Equation[], sep = ' '): ConcatenateOperation => {
		return {
			type: 'concatenate',
			values,
			separator: sep,
			tokens: values.flatMap((v) => v.tokens),
		};
	},
	color: (params: Omit<ColorOperation, 'type' | 'tokens'>): ColorOperation => {
		return {
			type: 'color',
			...params,
			tokens: params.parts.flatMap((v) => v.tokens),
		};
	},
	group: (value: Equation): GroupOperation => {
		return { type: 'group', value, tokens: value.tokens };
	},
};
export type CalcOperations = typeof $;

function printFunctionCall(
	name: string,
	args: string[],
	argPrinter: (value: string) => string = (value) => value,
): string {
	if (name === 'style' && args.length === 2) {
		return `style(${argPrinter(args[0])}: ${argPrinter(args[1])})`;
	}

	if (name === 'if') {
		const clauses: string[] = [];
		let index = 0;
		while (index + 1 < args.length) {
			clauses.push(
				`${argPrinter(args[index])}: ${argPrinter(args[index + 1])};`,
			);
			index += 2;
		}
		if (index < args.length) {
			clauses.push(`else: ${argPrinter(args[index])};`);
		}
		return `if(${clauses.join(' ')})`;
	}

	return `${name}(${args.map(argPrinter).join(', ')})`;
}

export function printEquation(equation: Equation): string {
	switch (equation.type) {
		case 'literal':
			return equation.value.toString();
		case 'token':
			if (equation.fallback)
				return equation.value.varFallback(printEquation(equation.fallback));
			return equation.value.var;
		case 'add':
			return `(${equation.values.map((v) => printEquation(v)).join(' + ')})`;
		case 'subtract':
			return `(${equation.values.map((v) => printEquation(v)).join(' - ')})`;
		case 'multiply':
			return `(${equation.values.map((v) => printEquation(v)).join(' * ')})`;
		case 'divide':
			return `(${equation.values.map((v) => printEquation(v)).join(' / ')})`;
		case 'cast':
			return `(${printEquation(equation.value)} * ${
				equation.unit === '%' ? '100%' : '1'
			})`;
		case 'function':
			return printFunctionCall(
				equation.name,
				equation.args.map((v) => printEquation(v)),
			);
		case 'concatenate':
			return equation.values
				.map((v) => printEquation(v))
				.join(equation.separator);
		case 'color':
			const fromPart =
				equation.from ? `from ${printEquation(equation.from)} ` : '';
			const opacityPart =
				equation.opacity ? ` / ${printEquation(equation.opacity)}` : '';
			return `${equation.space}(${fromPart}${equation.parts.map((v) => printEquation(v)).join(' ')}${opacityPart})`;
		case 'group':
			return `(${printEquation(equation.value)})`;
		default:
			throw new Error(`Unknown equation type: ${(equation as any).type}`);
	}
}

export type NumericComputationResult = {
	type: 'numeric';
	value: number;
	unit: '%' | string;
};
export type ComputationResult =
	| NumericComputationResult
	| {
			type: 'calc';
			value: string;
	  }
	| {
			type: 'concatenated';
			value: string;
	  };

function add(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} + ${printComputationResult(b)}`,
		};
	}
	if (a.value === 0) {
		return b;
	}
	if (b.value === 0) {
		return a;
	}
	if (a.type === 'calc' || b.type === 'calc' || a.unit !== b.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} + ${printComputationResult(
				b,
			)})`,
		};
	}
	return { type: 'numeric', value: a.value + b.value, unit: a.unit };
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
	if (b.value === 0) {
		return a;
	}
	if (a.value === 0 && b.type === 'numeric') {
		return { type: 'numeric', value: -b.value, unit: b.unit };
	}
	if (a.type === 'calc' || b.type === 'calc' || a.unit !== b.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} - ${printComputationResult(
				b,
			)})`,
		};
	}
	return { type: 'numeric', value: a.value - b.value, unit: a.unit };
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
	if (a.type === 'numeric' && a.value === 0) {
		return { type: 'numeric', value: 0, unit: a.unit };
	}
	if (b.type === 'numeric' && b.value === 0) {
		return { type: 'numeric', value: 0, unit: b.unit };
	}
	if (b.type === 'numeric' && a.type === 'numeric' && a.unit === '') {
		return {
			type: 'numeric',
			value: b.value * a.value,
			unit: b.unit,
		};
	}
	if (a.type === 'numeric' && b.type === 'numeric' && b.unit === '') {
		return {
			type: 'numeric',
			value: a.value * b.value,
			unit: a.unit,
		};
	}
	if (a.type === 'numeric' && a.unit === '' && a.value === 1) {
		return b;
	}
	if (b.type === 'numeric' && b.unit === '' && b.value === 1) {
		return a;
	}

	// TODO: does this align with the CSS spec for multiplying percentages?
	// this makes % "win"
	if (a.type === 'numeric' && a.unit === '%' && a.value === 100) {
		if (b.type !== 'numeric') {
			return b;
		}
		return {
			type: 'numeric',
			value: b.value * 100,
			unit: '%',
		};
	}
	if (b.type === 'numeric' && b.unit === '%' && b.value === 100) {
		if (a.type !== 'numeric') {
			return a;
		}
		return {
			type: 'numeric',
			value: a.value * 100,
			unit: '%',
		};
	}

	if (a.type === 'calc' || b.type === 'calc' || a.unit !== b.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} * ${printComputationResult(
				b,
			)})`,
		};
	}
	// now a.unit === b.unit.
	if (a.unit !== b.unit) {
		throw new Error(
			`Invalid state: units should have been checked to be the same at this point, but got ${a.unit} and ${b.unit}`,
		);
	}
	const unit = a.unit;
	if (unit === '%') {
		return { type: 'numeric', value: (a.value * b.value) / 100, unit: '%' };
	}
	return { type: 'numeric', value: a.value * b.value, unit };
}

function divide(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (a.type === 'concatenated' || b.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `${printComputationResult(a)} / ${printComputationResult(b)}`,
		};
	}
	if (b.type === 'numeric' && b.value === 0) {
		throw new Error('Division by zero');
	}
	if (a.type === 'numeric' && a.value === 0) {
		return { type: 'numeric', value: 0, unit: a.unit };
	}
	if (b.type === 'numeric' && b.value === 1 && b.unit === '') {
		return a;
	}
	if (b.type === 'numeric' && b.unit === '') {
		if (a.type === 'numeric') {
			return { type: 'numeric', value: a.value / b.value, unit: a.unit };
		}
	}
	if (a.type === 'calc' || b.type === 'calc' || a.unit !== b.unit) {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(a)} / ${printComputationResult(
				b,
			)})`,
		};
	}
	if (a.unit !== b.unit) {
		throw new Error(
			`Invalid state: units should have been checked to be the same at this point, but got ${a.unit} and ${b.unit}`,
		);
	}
	// units are erased when dividing - e.g. 10px / 5px = 2 (unitless)
	return { type: 'numeric', value: a.value / b.value, unit: '' };
}

function cast(value: ComputationResult, unit: '%' | string): ComputationResult {
	if (value.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `calc((${printComputationResult(value)}) * ${
				unit === '%' ? '100%' : '1'
			})`,
		};
	}
	if (value.type === 'calc') {
		return {
			type: 'calc',
			value: `calc(${printComputationResult(value)} * ${
				unit === '%' ? '100%' : '1'
			})`,
		};
	}
	if (unit === '%') {
		if (value.unit === '%') {
			return value;
		}
		return { type: 'numeric', value: value.value * 100, unit: '%' };
	} else {
		if (value.unit === '') {
			return value;
		}
		return { type: 'numeric', value: value.value / 100, unit: '' };
	}
}

function fnCall(name: string, ...args: ComputationResult[]): ComputationResult {
	// inline some functions if all args are numerics
	if (args.every((arg) => arg.type === 'numeric')) {
		const resolver = functionResolvers[name];
		if (resolver) {
			return resolver(...(args as NumericComputationResult[]));
		}
	}
	const isConcatenated = args.some((arg) => arg.type === 'concatenated');
	if (isConcatenated) {
		return {
			type: 'concatenated',
			value: printFunctionCall(name, args.map(printComputationResult)),
		};
	}
	return {
		type: 'calc',
		value: printFunctionCall(name, args.map(printComputationResult)),
	};
}

function evaluateStyleCondition(
	args: Equation[],
	context: CalcEvaluationContext,
): { decision?: boolean; text: string } {
	const computedArgs = args.map((arg) => computeEquation(arg, context));
	const text = printFunctionCall(
		'style',
		computedArgs.map(printComputationResult),
	);

	if (computedArgs.length !== 2 || context.skipBaking) {
		return { text };
	}

	const propertyName = printComputationResult(computedArgs[0]);
	if (!propertyName.startsWith('--')) {
		return { text };
	}

	const expectedValue = printComputationResult(computedArgs[1]).trim();
	const actualValue = evaluatePropertyValue(
		propertyName,
		context.propertyValues[propertyName],
		context,
	);
	if (actualValue === undefined) {
		return { text };
	}

	return { decision: actualValue.trim() === expectedValue, text };
}

function computeIfFunction(
	args: Equation[],
	context: CalcEvaluationContext,
): ComputationResult {
	const clauses: string[] = [];
	let hasUnknownCondition = false;

	let index = 0;
	while (index + 1 < args.length) {
		const condition = args[index];
		const value = args[index + 1];

		if (condition.type === 'function' && condition.name === 'style') {
			const style = evaluateStyleCondition(condition.args, context);
			if (style.decision === true) {
				return computeEquation(value, context);
			}
			if (style.decision === false) {
				index += 2;
				continue;
			}

			hasUnknownCondition = true;
			const computedValue = computeEquation(value, context);
			clauses.push(`${style.text}: ${printComputationResult(computedValue)};`);
			index += 2;
			continue;
		}

		hasUnknownCondition = true;
		const computedCondition = computeEquation(condition, context);
		const computedValue = computeEquation(value, context);
		clauses.push(
			`${printComputationResult(computedCondition)}: ${printComputationResult(computedValue)};`,
		);
		index += 2;
	}

	if (index < args.length) {
		const elseValue = computeEquation(args[index], context);
		if (!hasUnknownCondition) {
			return elseValue;
		}
		clauses.push(`else: ${printComputationResult(elseValue)};`);
	}

	if (!hasUnknownCondition) {
		return {
			type: 'calc',
			value: printFunctionCall(
				'if',
				args.map((arg) => printEquation(arg)),
			),
		};
	}

	return {
		type: 'calc',
		value: `if(${clauses.join(' ')})`,
	};
}

function removeWrappingParens(value: string): string {
	const trimmed = value.trim();
	let current = trimmed;
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
			// arithmetic operators
			insideValue.match(/[\+\*\/]/) ||
			// "-" is special since we allow it as a negative prefix -
			// only match non-first character instances
			insideValue.match(/.-\d/) ||
			// functions or variables - i.e. word(...
			insideValue.match(/\d+\(/) ||
			// spaces
			insideValue.match(/\s/);
		if (!isComplex) {
			return insideValue;
		}
	}
	return value;
}

export function printComputationResult(result: ComputationResult): string {
	if (result.type === 'calc') {
		return extractLiteralFromSimpleCalc(result.value.trim());
	}
	if (result.type === 'concatenated') {
		return result.value;
	}
	return `${result.value}${result.unit}`.trim();
}

function parseLiteralToNumeric(literal: string): ComputationResult | null {
	if (literal.endsWith('%')) {
		const asNumber = Number(literal.slice(0, -1));
		if (isNaN(asNumber)) {
			return null;
		}
		return { type: 'numeric', value: asNumber, unit: '%' };
	} else {
		const match = literal.match(/^(-?\d*\.?\d+)([a-zA-Z]*)$/);
		if (!match) {
			return null;
		}
		const [, numberPart, unitPart] = match;
		const asNumber = Number(numberPart);
		if (isNaN(asNumber)) {
			return null;
		}
		return { type: 'numeric', value: asNumber, unit: unitPart };
	}
}

function evaluateLiteral(
	literal: string,
	context: CalcEvaluationContext,
): ComputationResult {
	if (literal.startsWith('var(')) {
		// account for fallback in the var() case
		let nameEnd = literal.indexOf(',');
		if (nameEnd === -1) {
			nameEnd = literal.length - 1;
		}
		const propertyName = literal.slice(4, nameEnd).trim();
		const propertyValue = evaluatePropertyValue(
			propertyName,
			context.propertyValues[propertyName],
			context,
		);
		if (!propertyValue || context.skipBaking) {
			return { type: 'calc', value: literal };
		}
		if (context.resolvingProperties?.has(propertyName)) {
			return { type: 'calc', value: `var(${propertyName})` };
		}

		context.resolvingProperties?.add(propertyName);
		try {
			// replace literal with known value from context
			return evaluateLiteral(propertyValue, context);
		} catch (err) {
			console.warn(
				`Error evaluating property ${propertyName} with value ${propertyValue}:`,
				err,
			);
			throw err;
		} finally {
			context.resolvingProperties?.delete(propertyName);
		}
	} else if (literal === 'PI') {
		return { type: 'numeric', value: Math.PI, unit: '' };
	} else {
		const parsed = parseLiteralToNumeric(literal);
		if (parsed) {
			return parsed;
		}
		return { type: 'calc', value: literal };
	}
}

function evaluatePropertyValue(
	propertyName: string,
	propertyValue: string | number | Equation | undefined,
	context: CalcEvaluationContext,
): string | undefined {
	// sanity check
	if (isToken(propertyValue)) {
		throw new Error(
			`Unexpected token reference for property ${propertyName} during evaluation - tokens should have been resolved to their fallback or inlined value at this point. Got token: ${propertyValue.name}`,
		);
	}

	if (propertyValue === undefined) {
		return undefined;
	}

	if (typeof propertyValue === 'string') {
		return propertyValue;
	}

	if (typeof propertyValue === 'number') {
		return propertyValue.toString();
	}

	if (context.resolvingProperties?.has(propertyName)) {
		return `var(${propertyName})`;
	}

	context.resolvingProperties?.add(propertyName);
	try {
		return printComputationResult(computeEquation(propertyValue, context));
	} finally {
		context.resolvingProperties?.delete(propertyName);
	}
}

export function computeEquation(
	equation: Equation,
	userContext: CalcEvaluationContext = { propertyValues: {} },
): ComputationResult {
	const rawResult = computeEquationRaw(equation, userContext);

	// attempt to simplify before continuing; if the result is
	// a simple value like calc(3), we unwrap it first.
	if (rawResult.type === 'calc') {
		const extracted = extractLiteralFromSimpleCalc(rawResult.value);
		if (extracted !== rawResult.value) {
			return evaluateLiteral(extracted, userContext);
		}
	}
	return rawResult;
}

function computeEquationRaw(
	equation: Equation,
	userContext: CalcEvaluationContext = { propertyValues: {} },
): ComputationResult {
	const context: CalcEvaluationContext = {
		propertyValues: userContext.propertyValues,
		// unless otherwise specified, we do NOT bake literal values when
		// running in a browser - this makes a runtime-evaluated equation
		// responsive to runtime-tweaked globals.
		skipBaking: userContext.skipBaking ?? typeof window !== 'undefined',
		resolvingProperties: userContext.resolvingProperties ?? new Set(),
	};
	switch (equation.type) {
		case 'literal':
			return evaluateLiteral(equation.value.toString(), context);
		case 'token':
			const evaluated = evaluateLiteral(equation.value.var, context);
			const wasNotResolved =
				evaluated.type === 'calc' && evaluated.value === equation.value.var;
			if (wasNotResolved && equation.fallback) {
				// token value is not known at runtime, so we compute the fallback and inline it too
				const computedFallback = computeEquation(equation.fallback, context);
				return {
					type: 'calc',
					value: `var(${equation.value.name}, ${printComputationResult(
						computedFallback,
					)})`,
				};
			}
			return evaluated;
		case 'add':
			return equation.values.reduce<ComputationResult>(
				(sum, v) => add(sum, computeEquation(v, context)),
				{ type: 'numeric', value: 0, unit: '' },
			);
		case 'subtract':
			if (equation.values.length === 0) {
				return { type: 'numeric', value: 0, unit: '' };
			}
			const first = computeEquation(equation.values[0], context);
			return equation.values
				.slice(1)
				.reduce(
					(difference, v) => subtract(difference, computeEquation(v, context)),
					first,
				);
		case 'multiply':
			return equation.values
				.slice(1)
				.reduce<ComputationResult>(
					(product, v) => multiply(product, computeEquation(v, context)),
					computeEquation(equation.values[0], context),
				);
		case 'divide':
			if (equation.values.length !== 2) {
				throw new Error('Divide operation requires exactly 2 values');
			}
			const numerator = computeEquation(equation.values[0], context);
			const denominator = computeEquation(equation.values[1], context);
			return divide(numerator, denominator);
		case 'cast':
			const innerValue = computeEquation(equation.value, context);
			return cast(innerValue, equation.unit);
		case 'function':
			if (equation.name === 'if') {
				return computeIfFunction(equation.args, context);
			}
			if (equation.name === 'style') {
				const style = evaluateStyleCondition(equation.args, context);
				return {
					type: 'calc',
					value: style.text,
				};
			}
			const args = equation.args.map((arg) => computeEquation(arg, context));
			return fnCall(equation.name, ...args);
		case 'concatenate':
			const concatenatedValues = equation.values.map((v) =>
				printComputationResult(computeEquation(v, context)),
			);
			return {
				type: 'concatenated',
				value: concatenatedValues.join(equation.separator),
			};
		case 'color':
			// color computations are not supported at runtime (beyond simple var() passthroughs)
			const colorString = printEquation(equation);
			return { type: 'calc', value: colorString };
		case 'group':
			return computeEquation(equation.value, context);
		default:
			throw new Error(`Unknown equation type: ${(equation as any).type}`);
	}
}
