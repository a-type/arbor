import {
	CalcInterpolation,
	computeEquation,
	css,
	Css,
	type Equation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';
import { isToken } from '@arbor-css/tokens';

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

type CssProperty = `--${string}`;
type FunctionParams = readonly CssProperty[];
type ParamsAsInterpolations<TParams extends FunctionParams> = {
	[K in keyof TParams]: CalcInterpolation;
};

/**
 * Creates a CSS custom function definition with runtime compute capability.
 *
 * @example
 * const spacing = createFunction('spacing-scale', {
 *   description: 'Scales a base spacing value by a multiplier',
 *   parameters: [
 *     createToken('base', { name: 'base', type: 'length' }),
 *     createToken('scale', { name: 'scale', type: 'number' }),
 *   ],
 *   definition: (base, scale) => $.multiply(base, scale),
 * });
 *
 * spacing.definition // @function --spacing-scale(--base <length>, --scale <number>) { result: (var(--base) * var(--scale)); }
 * spacing.compute({ base: '8px', scale: 2 }) // 'calc(var(--base) * 2)' or '16px'
 */
export function createFunction<TParams extends FunctionParams>(
	name: string,
	{
		description,
		parameters,
		definition,
	}: {
		description?: string;
		/**
		 * Define names to represent each function parameter.
		 */
		parameters: TParams;
		/**
		 * Provide the definition of the function, using calc tools to construct
		 * an equation. The incoming parameters are already wrapped with literal()
		 */
		definition: (css: Css, ...params: CalcInterpolation[]) => Equation;
	},
): ArborFunction<TParams> {
	const cssName = `${FUNCTION_PREFIX}${name}`;

	const paramsList = parameters
		.map((p) => {
			if (isToken(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `${p.name}${typeAnnotation}`;
			}
			return p;
		})
		.join(', ');

	const equation = definition(css, ...parameters.map((p) => `var(${p})`));
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
		 * Inline the body of the function as a CSS equation, supplying
		 * tokens to substitute for the normal parameters.
		 */
		inline: (...params: ParamsAsInterpolations<TParams>) =>
			definition(css, ...params),
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

export type ArborFunction<TParams extends FunctionParams> = {
	[FUNCTION_BRAND]: true;
	name: string;
	description?: string;
	parameters: TParams;
	equation: Equation;
	definition: string;
	inline: (...params: ParamsAsInterpolations<TParams>) => Equation;
	compute: (params: Record<string, string | number>) => string;
};
export type PresetFunctions = Record<string, ArborFunction<any>>;

export function isFunction(value: unknown): value is ArborFunction<any> {
	return typeof value === 'object' && value !== null && FUNCTION_BRAND in value;
}
