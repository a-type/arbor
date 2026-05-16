import {
	computeEquation,
	type Equation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';

export const FUNCTION_PREFIX = '--';

export type ParameterSchema = {
	name: string;
	/**
	 * The CSS type for this parameter. Defaults to '*' (any).
	 * Used in the @function parameter list as <type>.
	 */
	type?: string;
};

const FUNCTION_BRAND = '@@FUNCTION@@';

/**
 * Creates a CSS custom function definition with runtime compute capability.
 *
 * The equation should reference parameters using CSS variable syntax, e.g.
 * `$.literal('var(--param-name)')`. At runtime, `compute()` resolves those
 * variables from the provided parameter values.
 *
 * @example
 * const spacing = createFunction('spacing-scale', {
 *   description: 'Scales a base spacing value by a multiplier',
 *   parameters: [
 *     { name: 'base', type: 'length' },
 *     { name: 'scale', type: 'number' },
 *   ],
 *   definition: $.multiply($.literal('var(--base)'), $.literal('var(--scale)')),
 * });
 *
 * spacing.definition // @function --spacing-scale(--base <length>, --scale <number>) { result: (var(--base) * var(--scale)); }
 * spacing.compute({ base: '8px', scale: 2 }) // 'calc(var(--base) * 2)' or '16px'
 */
export function createFunction(
	name: string,
	{
		description,
		parameters,
		definition: equation,
	}: {
		description?: string;
		parameters: ParameterSchema[];
		definition: Equation;
	},
) {
	const cssName = `${FUNCTION_PREFIX}${name}`;

	const paramsList = parameters
		.map((p) => {
			const type = p.type ?? '*';
			const typeAnnotation = type === '*' ? '' : ` <${type}>`;
			return `--${p.name}${typeAnnotation}`;
		})
		.join(', ');

	const body = printEquation(equation);
	const cssDefinition = `@function ${cssName}(${paramsList}) { result: ${body}; }`;

	return {
		[FUNCTION_BRAND]: true as const,
		name: cssName,
		description,
		parameters,
		equation,
		definition: cssDefinition,
		/**
		 * Compute the function result at runtime by substituting parameter values.
		 * Parameter keys should match parameter names (without the -- prefix).
		 */
		compute(params: Record<string, string | number>): string {
			const propertyValues: Record<string, string> = {};
			for (const [key, value] of Object.entries(params)) {
				propertyValues[`--${key}`] = String(value);
			}
			const result = computeEquation(equation, {
				propertyValues,
				skipBaking: false,
			});
			return printComputationResult(result);
		},
	};
}

export type ArborFunction = ReturnType<typeof createFunction>;

export function isFunction(value: unknown): value is ArborFunction {
	return typeof value === 'object' && value !== null && FUNCTION_BRAND in value;
}
