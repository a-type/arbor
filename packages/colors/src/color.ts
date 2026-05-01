import {
	$,
	CalcEvaluationContext,
	CalcOperations,
	ComputationResult,
	Equation,
	computeEquation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';

export interface OklchColorEquation {
	l: Equation;
	c: Equation;
	h: Equation;

	/**
	 * Prints the CSS value of the color equation, including all
	 * calculations and variable references - fully dynamic.
	 */
	printDynamic(context: CalcEvaluationContext): string;
	/**
	 * Uses the equation and provided context to compute a static
	 * OKLCH color string with calculations and references resolved.
	 */
	printComputed(context: CalcEvaluationContext): string;
	/**
	 * Returns the raw computed L, C, H values as numbers with units.
	 */
	compute(ctx: CalcEvaluationContext): {
		l: ComputationResult;
		c: ComputationResult;
		h: ComputationResult;
	};
}

export function oklchBuilder(
	impl: ($: CalcOperations) => {
		from?: Equation;
		l: Equation;
		c: Equation;
		h: Equation;
	},
): OklchColorEquation {
	const equations = impl($);

	function compute(context: CalcEvaluationContext) {
		const l = computeEquation(equations.l, context);
		const c = computeEquation(equations.c, context);
		const h = computeEquation(equations.h, context);
		const from =
			equations.from ? computeEquation(equations.from, context) : undefined;
		return { l, c, h, from };
	}

	return {
		...equations,
		printDynamic(): string {
			const l = printEquation(equations.l);
			const c = printEquation(equations.c);
			const h = printEquation(equations.h);
			const from = equations.from ? printEquation(equations.from) : undefined;
			return `oklch(${
				from ? `from ${from} ` : ''
			}calc(${l}) calc(${c}) calc(${h}))`;
		},
		printComputed(context: CalcEvaluationContext): string {
			const { l, c, h, from } = compute(context);
			return `oklch(${
				from ? `from ${printComputationResult(from)} ` : ''
			}${printComputationResult(l)} ${printComputationResult(
				c,
			)} ${printComputationResult(h)})`;
		},
		compute,
	};
}
