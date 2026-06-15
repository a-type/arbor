import {
	CalcEvaluationContext,
	ComputationResult,
	Equation,
	computeEquation,
	css,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';

export interface OklchColorEquation {
	l: Equation;
	c: Equation;
	h: Equation;
	from?: Equation;
	compiled: Equation;

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
	computeParts(ctx: CalcEvaluationContext): {
		l: ComputationResult;
		c: ComputationResult;
		h: ComputationResult;
	};
}

export function oklchBuilder(
	impl: () => {
		from?: Equation;
		l: Equation;
		c: Equation;
		h: Equation;
	},
): OklchColorEquation {
	const equations = impl();

	function compute(context: CalcEvaluationContext) {
		const l = computeEquation(equations.l, context);
		const c = computeEquation(equations.c, context);
		const h = computeEquation(equations.h, context);
		const from =
			equations.from ? computeEquation(equations.from, context) : undefined;
		return { l, c, h, from };
	}

	const compiled = css`oklch(${
		equations.from ? `from ${equations.from} ` : ''
	}calc(${equations.l}) calc(${equations.c}) calc(${equations.h}))`;

	return {
		...equations,
		compiled: css`oklch(${
			equations.from ? `from ${equations.from} ` : ''
		}calc(${equations.l}) calc(${equations.c}) calc(${equations.h}))`,
		printDynamic(): string {
			return printEquation(compiled);
		},
		printComputed(context: CalcEvaluationContext): string {
			return printComputationResult(computeEquation(compiled, context));
		},
		computeParts: compute,
	};
}
