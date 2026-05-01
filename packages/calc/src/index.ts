export interface CalcEvaluationContext {
	propertyValues: Record<string, string | undefined>;
}

export type Equation = OperationTree;
export type OperationTree =
	| AddOperation
	| SubtractOperation
	| MultiplyOperation
	| DivideOperation
	| LiteralOperation
	| ClampOperation
	| CastOperation
	| FunctionCallOperation;
interface AddOperation {
	type: 'add';
	values: Equation[];
}
interface SubtractOperation {
	type: 'subtract';
	values: Equation[];
}
interface MultiplyOperation {
	type: 'multiply';
	values: Equation[];
}
interface DivideOperation {
	type: 'divide';
	values: [Equation, Equation];
}
interface LiteralOperation {
	type: 'literal';
	value: string | number;
}
interface ClampOperation {
	type: 'clamp';
	values: Equation[];
}
interface CastOperation {
	type: 'cast';
	value: Equation;
	unit: '%' | '';
}
interface FunctionCallOperation {
	type: 'function';
	name: string;
	args: Equation[];
}

export const $ = {
	literal: (value: string | number): LiteralOperation => {
		if (typeof value === 'string' || typeof value === 'number') {
			return { type: 'literal', value };
		}
		return { type: 'literal', value };
	},
	add: (...values: Equation[]): AddOperation => {
		return { type: 'add', values };
	},
	subtract: (...values: Equation[]): SubtractOperation => {
		return { type: 'subtract', values };
	},
	multiply: (...values: Equation[]): MultiplyOperation => {
		return { type: 'multiply', values };
	},
	divide: (numerator: Equation, denominator: Equation): DivideOperation => {
		return { type: 'divide', values: [numerator, denominator] };
	},
	clamp: (equation: Equation, min: Equation, max: Equation): Equation => {
		return { type: 'clamp', values: [min, equation, max] };
	},
	castPercentage: (value: Equation): Equation => {
		return { type: 'cast', value, unit: '%' };
	},
	fn: (name: string, ...args: Equation[]): FunctionCallOperation => {
		return { type: 'function', name, args };
	},
};
export type CalcOperations = typeof $;

export function printEquation(equation: Equation): string {
	switch (equation.type) {
		case 'literal':
			return equation.value.toString();
		case 'add':
			return `(${equation.values.map((v) => printEquation(v)).join(' + ')})`;
		case 'subtract':
			return `(${equation.values.map((v) => printEquation(v)).join(' - ')})`;
		case 'multiply':
			return `(${equation.values.map((v) => printEquation(v)).join(' * ')})`;
		case 'divide':
			return `(${equation.values.map((v) => printEquation(v)).join(' / ')})`;
		case 'clamp':
			if (equation.values.length !== 3) {
				throw new Error(
					'Clamp operation requires exactly 3 values: min, value, max',
				);
			}
			return `clamp(${equation.values
				.map((v) => printEquation(v))
				.join(', ')})`;
		case 'cast':
			return `(${printEquation(equation.value)} * ${
				equation.unit === '%' ? '100%' : '1'
			})`;
		case 'function':
			return `${equation.name}(${equation.args
				.map((v) => printEquation(v))
				.join(', ')})`;
		default:
			throw new Error(`Unknown equation type: ${(equation as any).type}`);
	}
}

export type ComputationResult =
	| {
			type: 'numeric';
			value: number;
			unit: '%' | '';
	  }
	| {
			type: 'calc';
			value: string;
	  };

function add(a: ComputationResult, b: ComputationResult): ComputationResult {
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
	if (a.type === 'numeric' && a.value === 0) {
		return { type: 'numeric', value: 0, unit: a.unit };
	}
	if (b.type === 'numeric' && b.value === 0) {
		return { type: 'numeric', value: 0, unit: b.unit };
	}
	if (a.type === 'numeric' && a.value === 1) {
		return b;
	}
	if (b.type === 'numeric' && b.value === 1) {
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
	if (a.unit === '%' && b.unit === '%') {
		return { type: 'numeric', value: (a.value * b.value) / 100, unit: '%' };
	}
	const unit = a.unit === '%' || b.unit === '%' ? '%' : '';
	return { type: 'numeric', value: a.value * b.value, unit };
}

function divide(a: ComputationResult, b: ComputationResult): ComputationResult {
	if (b.type === 'numeric' && b.value === 0) {
		throw new Error('Division by zero');
	}
	if (a.type === 'numeric' && a.value === 0) {
		return { type: 'numeric', value: 0, unit: a.unit };
	}
	if (b.type === 'numeric' && b.value === 1) {
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
	if (a.unit === '%' && b.unit === '%') {
		return { type: 'numeric', value: a.value / b.value, unit: '' };
	}
	const unit = a.unit === '%' && b.unit === '' ? '%' : '';
	return { type: 'numeric', value: a.value / b.value, unit };
}

function clamp(
	value: ComputationResult,
	min: ComputationResult,
	max: ComputationResult,
): ComputationResult {
	if (
		value.type === 'calc' ||
		min.type === 'calc' ||
		max.type === 'calc' ||
		value.unit !== min.unit ||
		value.unit !== max.unit ||
		min.unit !== max.unit
	) {
		return {
			type: 'calc',
			value: `calc(clamp(${printComputationResult(
				min,
			)}, ${printComputationResult(value)}, ${printComputationResult(max)}))`,
		};
	}
	return {
		type: 'numeric',
		value: Math.min(Math.max(value.value, min.value), max.value),
		unit: value.unit,
	};
}

function cast(value: ComputationResult, unit: '%' | ''): ComputationResult {
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
	return {
		type: 'calc',
		value: `${name}(${args.map(printComputationResult).join(', ')})`,
	};
}

export function printComputationResult(result: ComputationResult): string {
	if (result.type === 'calc') {
		return result.value;
	}
	return result.unit === '%' ? `${result.value}%` : `${result.value}`;
}

function evaluateLiteral(
	literal: string,
	context: CalcEvaluationContext,
): ComputationResult {
	if (literal.startsWith('var(')) {
		const propertyName = literal.slice(4, -1).trim();
		const propertyValue = context.propertyValues[propertyName];
		if (!propertyValue) {
			return { type: 'calc', value: literal };
		} else {
			return evaluateLiteral(propertyValue, context);
		}
	} else if (literal === 'PI') {
		return { type: 'numeric', value: Math.PI, unit: '' };
	} else if (literal.endsWith('%')) {
		const asNumber = Number(literal.slice(0, -1));
		if (isNaN(asNumber)) {
			throw new Error(`Literal value did not evaluate to a number: ${literal}`);
		}
		return { type: 'numeric', value: asNumber, unit: '%' };
	} else {
		const asNumber = Number(literal);
		if (isNaN(asNumber)) {
			return { type: 'calc', value: literal };
		}
		return { type: 'numeric', value: asNumber, unit: '' };
	}
}

export function computeEquation(
	equation: Equation,
	context: CalcEvaluationContext,
): ComputationResult {
	switch (equation.type) {
		case 'literal':
			return evaluateLiteral(equation.value.toString(), context);
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
		case 'clamp':
			if (equation.values.length !== 3) {
				throw new Error(
					'Clamp operation requires exactly 3 values: min, value, max',
				);
			}
			const min = computeEquation(equation.values[0], context);
			const value = computeEquation(equation.values[1], context);
			const max = computeEquation(equation.values[2], context);
			return clamp(value, min, max);
		case 'cast':
			const innerValue = computeEquation(equation.value, context);
			return cast(innerValue, equation.unit);
		case 'function':
			const args = equation.args.map((arg) => computeEquation(arg, context));
			return fnCall(equation.name, ...args);
		default:
			throw new Error(`Unknown equation type: ${(equation as any).type}`);
	}
}
