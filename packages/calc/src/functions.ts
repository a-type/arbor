import { ComputationResult, NumericComputationResult } from './calcTree.js';

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

export const functionResolvers: Record<
	string,
	(...args: NumericComputationResult[]) => NumericComputationResult
> = {
	sin: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.sin(numericToNumber(x)),
		unit: x.unit,
	}),
	cos: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.cos(numericToNumber(x)),
		unit: x.unit,
	}),
	tan: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.tan(numericToNumber(x)),
		unit: x.unit,
	}),
	round: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.round(numericToNumber(x)),
		unit: x.unit,
	}),
	floor: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.floor(numericToNumber(x)),
		unit: x.unit,
	}),
	ceil: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.ceil(numericToNumber(x)),
		unit: x.unit,
	}),
	min: (...args: NumericComputationResult[]) => {
		const unit = args[0].unit;
		if (!args.every((arg) => arg.unit === unit)) {
			throw new Error('All arguments to min must have the same unit');
		}
		return {
			type: 'numeric',
			value: Math.min(...args.map((arg) => numericToNumber(arg))),
			unit,
		};
	},
	max: (...args: NumericComputationResult[]) => {
		const unit = args[0].unit;
		if (!args.every((arg) => arg.unit === unit)) {
			throw new Error('All arguments to max must have the same unit');
		}
		return {
			type: 'numeric',
			value: Math.max(...args.map((arg) => numericToNumber(arg))),
			unit,
		};
	},
	clamp: (
		min: NumericComputationResult,
		val: NumericComputationResult,
		max: NumericComputationResult,
	) => {
		if (!areCompatibleNumerics([min, val, max])) {
			throw new Error('All arguments to clamp must have the same unit');
		}
		return {
			type: 'numeric',
			value: Math.min(
				Math.max(numericToNumber(val), numericToNumber(min)),
				numericToNumber(max),
			),
			unit: min.unit,
		};
	},
	pow: (base: NumericComputationResult, exponent: NumericComputationResult) => {
		if (exponent.unit !== '' && exponent.unit !== 'number') {
			throw new Error('Exponent must be unitless');
		}
		return {
			type: 'numeric',
			value: Math.pow(numericToNumber(base), numericToNumber(exponent)),
			unit: base.unit,
		};
	},
	abs: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.abs(numericToNumber(x)),
		unit: x.unit,
	}),
	exp: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.exp(numericToNumber(x)),
		unit: x.unit,
	}),
	log: (x: NumericComputationResult) => ({
		type: 'numeric',
		value: Math.log(numericToNumber(x)),
		unit: x.unit,
	}),
};
