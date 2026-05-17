import { Token } from '@arbor-css/tokens';

export interface CalcEvaluationContext {
	propertyValues: Record<string, string | undefined>;
	/** Prevents the baking of known literals into calculations. */
	skipBaking?: boolean;
}

export function isCalcEquation(value: any): value is Equation {
	return value && typeof value === 'object' && 'type' in value;
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
			return `calc(${equation.name}(${equation.args
				.map((v) => printEquation(v))
				.join(', ')}))`;
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

export type ComputationResult =
	| {
			type: 'numeric';
			value: number;
			unit: '%' | string;
	  }
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
	if (a.type === 'numeric' && a.unit === '' && a.value === 1) {
		return b;
	}
	if (b.type === 'numeric' && b.unit === '' && b.value === 1) {
		return a;
	}
	if (a.type === 'numeric' && a.unit === '%' && a.value === 100) {
		return b;
	}
	if (b.type === 'numeric' && b.unit === '%' && b.value === 100) {
		return a;
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
	const unit = a.unit;
	if (unit === '%') {
		return { type: 'numeric', value: a.value / b.value, unit: '' };
	}
	return { type: 'numeric', value: a.value / b.value, unit };
}

function cast(value: ComputationResult, unit: '%' | string): ComputationResult {
	if (value.type === 'concatenated') {
		return {
			type: 'concatenated',
			value: `(${printComputationResult(value)} * ${
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

function numericToNumber(value: {
	type: 'numeric';
	value: number;
	unit: string;
}): number {
	if (value.unit === '%') {
		return value.value / 100;
	}
	return value.value;
}
function areCompatibleNumerics(values: ComputationResult[]): boolean {
	const units = new Set(
		values
			.filter(
				(v): v is Extract<ComputationResult, { type: 'numeric' }> =>
					v.type === 'numeric',
			)
			// exclude zeroes since they are compatible with any unit
			.filter((v) => v.value !== 0)
			.map((v) => v.unit),
	);
	return units.size <= 1;
}
function fnCall(name: string, ...args: ComputationResult[]): ComputationResult {
	// inline some functions if all args are numerics
	if (args.every((arg) => arg.type === 'numeric')) {
		const argsInOrderAsNumbers = args.map((arg) =>
			numericToNumber(arg as Extract<ComputationResult, { type: 'numeric' }>),
		);
		switch (name) {
			case 'sin':
				return {
					type: 'numeric',
					value: Math.sin(argsInOrderAsNumbers[0]),
					unit: '',
				};
			case 'cos':
				return {
					type: 'numeric',
					value: Math.cos(argsInOrderAsNumbers[0]),
					unit: '',
				};
			case 'tan':
				return {
					type: 'numeric',
					value: Math.tan(argsInOrderAsNumbers[0]),
					unit: '',
				};
			case 'min':
				return {
					type: 'numeric',
					value: Math.min(...argsInOrderAsNumbers),
					unit: '',
				};
			case 'max':
				return {
					type: 'numeric',
					value: Math.max(...argsInOrderAsNumbers),
					unit: '',
				};
			case 'clamp': {
				const minArg = args[0] as Extract<
					ComputationResult,
					{ type: 'numeric' }
				>;
				const valArg = args[1] as Extract<
					ComputationResult,
					{ type: 'numeric' }
				>;
				const maxArg = args[2] as Extract<
					ComputationResult,
					{ type: 'numeric' }
				>;
				if (!areCompatibleNumerics([minArg, valArg, maxArg])) {
					break;
				}
				return {
					type: 'numeric',
					value: Math.min(Math.max(valArg.value, minArg.value), maxArg.value),
					unit: valArg.unit,
				};
			}
			case 'pow':
				return {
					type: 'numeric',
					value: Math.pow(argsInOrderAsNumbers[0], argsInOrderAsNumbers[1]),
					unit: '',
				};
			case 'abs':
				return {
					type: 'numeric',
					value: Math.abs(argsInOrderAsNumbers[0]),
					unit: '',
				};
			case 'exp':
				return {
					type: 'numeric',
					value: Math.exp(argsInOrderAsNumbers[0]),
					unit: '',
				};
			case 'log':
				return {
					type: 'numeric',
					value: Math.log(argsInOrderAsNumbers[0]),
					unit: '',
				};
			default:
				break;
		}
	}
	const isConcatenated = args.some((arg) => arg.type === 'concatenated');
	if (isConcatenated) {
		return {
			type: 'concatenated',
			value: `calc(${name}(${args.map(printComputationResult).join(', ')}))`,
		};
	}
	return {
		type: 'calc',
		value: `calc(${name}(${args.map(printComputationResult).join(', ')}))`,
	};
}

export function printComputationResult(result: ComputationResult): string {
	if (result.type === 'calc') {
		return result.value;
	}
	if (result.type === 'concatenated') {
		return result.value;
	}
	return `${result.value}${result.unit}`;
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
		const propertyName = literal.slice(4, -1).trim();
		const propertyValue = context.propertyValues[propertyName];
		if (!propertyValue || context.skipBaking) {
			return { type: 'calc', value: literal };
		} else {
			// replace literal with known value from context
			return evaluateLiteral(propertyValue, context);
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

export function computeEquation(
	equation: Equation,
	userContext: CalcEvaluationContext,
): ComputationResult {
	const context: CalcEvaluationContext = {
		propertyValues: userContext.propertyValues,
		// unless otherwise specified, we do NOT bake literal values when
		// running in a browser - this makes a runtime-evaluated equation
		// responsive to runtime-tweaked globals.
		skipBaking: userContext.skipBaking ?? typeof window !== 'undefined',
	};
	switch (equation.type) {
		case 'literal':
			return evaluateLiteral(equation.value.toString(), context);
		case 'token':
			const evaluated = evaluateLiteral(equation.value.var, context);
			if (evaluated.type === 'numeric') {
				return evaluated;
			}
			if (equation.fallback) {
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
			return equation.values.reduce<ComputationResult>(
				(product, v) => multiply(product, computeEquation(v, context)),
				{ type: 'numeric', value: 1, unit: '' },
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
