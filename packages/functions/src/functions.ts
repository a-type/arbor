import {
	computeEquation,
	css,
	Css,
	type Equation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';
import {
	FunctionParams,
	isFunctionParamWithMeta,
	ParamsAsInterpolations,
	paramsAsInterpolations,
	paramsAsString,
} from './common.js';

export const DEFAULT_FUNCTION_NAME_PREFIX = '--fn-';

export type ParameterSchema = {
	name: string;
	/**
	 * The CSS type for this parameter. Defaults to '*' (any).
	 * Used in the @function parameter list as <type>.
	 */
	type?: string;
};

const FUNCTION_BRAND = '@@FUNCTION@@';

export type CreateFunctionParameters<TParams extends FunctionParams> = {
	description?: string;
	parameters: TParams;
	definition: (
		css: Css,
		...params: ParamsAsInterpolations<TParams>
	) => Equation;
};
/**
 * Creates a CSS custom function definition with runtime compute capability.
 *
 * @example
 * const spacing = createFunction('spacing-scale', {
 *   description: 'Scales a base spacing value by a multiplier',
 *   parameters: [
 *     '--base',
 *     '--scale',
 *   ],
 *   definition: (css, base, scale) => css`calc(${base} * ${scale})`,
 * });
 *
 * spacing.definition // @function --spacing-scale(--base <length>, --scale <number>) { result: (var(--base) * var(--scale)); }
 * spacing.compute({ base: '8px', scale: 2 }) // 'calc(var(--base) * 2)' or '16px'
 */
export type CreateFunction = (
	name: string,
	parameters: CreateFunctionParameters<any>,
) => ArborFunction<any>;

export function createFunctionFactory({
	namePrefix = DEFAULT_FUNCTION_NAME_PREFIX,
}: {
	namePrefix?: string;
} = {}) {
	const functionPrefix = namePrefix;

	return function createFunction<TParams extends FunctionParams>(
		name: string,
		{ description, parameters, definition }: CreateFunctionParameters<TParams>,
	): ArborFunction<TParams> {
		const cssName = `${functionPrefix}${name}`;
		const paramsList = paramsAsString(parameters, true);

		const equation = definition(css, ...paramsAsInterpolations(parameters));
		const body = printEquation(equation);
		const cssDefinition = `@function ${cssName}${paramsList} { result: ${body}; }`;

		return {
			[FUNCTION_BRAND]: true as const,
			name: cssName,
			description,
			parameters,
			equation,
			definition: cssDefinition,
			inline: (...params: ParamsAsInterpolations<TParams>) =>
				definition(css, ...params),
			compute(params: Record<string, string | number>): string {
				const propertyValues: Record<string, string> = {};
				for (let index = 0; index < parameters.length; index++) {
					const parameter = parameters[index];
					const cssParameterName =
						isFunctionParamWithMeta(parameter) ? parameter.name : parameter;
					const fallback =
						isFunctionParamWithMeta(parameter) ? parameter.fallback : undefined;
					propertyValues[cssParameterName] = String(
						params[cssParameterName] ?? fallback,
					);
				}
				const result = computeEquation(equation, {
					propertyValues,
					skipBaking: false,
				});
				return printComputationResult(result);
			},
		};
	} satisfies CreateFunction;
}

export type ArborFunction<TParams extends FunctionParams = FunctionParams> = {
	[FUNCTION_BRAND]: true;
	name: string;
	description?: string;
	parameters: TParams;
	equation: Equation;
	definition: string;
	inline: (...params: ParamsAsInterpolations<TParams>) => Equation;
	compute: (params: Record<string, string | number>) => string;
};
export type PresetFunctions = Record<string, ArborFunction>;

export function isFunction(
	value: unknown,
): value is ArborFunction<FunctionParams> {
	return typeof value === 'object' && value !== null && FUNCTION_BRAND in value;
}
