import {
	CalcEvaluationContext,
	computeEquation,
	css,
	Css,
	type Equation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';
import { Token } from '@arbor-css/tokens';
import {
	applyParameters,
	FunctionParams,
	paramAsToken,
	ParamsAsCallInputs,
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
export type CreateFunction = <TParams extends FunctionParams>(
	name: string,
	parameters: CreateFunctionParameters<TParams>,
) => ArborFunction<TParams>;

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
		const paramsList = paramsAsString(parameters, {
			keepEmpty: true,
			nonce: name,
		});
		const paramsAsTokens = parameters.map((p) => paramAsToken(p, name));
		const equation = definition(
			css,
			...paramsAsInterpolations(parameters, name),
		);
		const body = printEquation(equation);
		const cssDefinition = `@function ${cssName}${paramsList} { result: ${body}; }`;

		return {
			[FUNCTION_BRAND]: true as const,
			name: cssName,
			description,
			parameters,
			parameterTokens: paramsAsTokens,
			equation,
			definition: cssDefinition,
			compute(
				params: ParamsAsCallInputs<TParams>,
				ctx?: CalcEvaluationContext,
			): string {
				const parameterValues: Record<string, string | Equation> = {};
				applyParameters(parameters, params, name, (paramName, value) => {
					parameterValues[paramName] = value;
				});
				const result = computeEquation(equation, {
					...ctx,
					propertyValues: {
						...ctx?.propertyValues,
						...parameterValues,
					},
				});
				return printComputationResult(result);
			},
			signature: `${cssName}${paramsAsString(parameters, { keepEmpty: true })}`,
		};
	} satisfies CreateFunction;
}

export type ArborFunction<TParams extends FunctionParams = FunctionParams> = {
	[FUNCTION_BRAND]: true;
	name: string;
	description?: string;
	parameters: TParams;
	parameterTokens: Token[];
	equation: Equation;
	definition: string;
	compute: (
		params: ParamsAsCallInputs<TParams>,
		ctx?: CalcEvaluationContext,
	) => string;
	/**
	 * A printed representation of the function call signature, for use in
	 * documentation and error messages
	 *
	 * @example
	 * --fn-spacing-scale(--base <length>, --scale <number>)
	 */
	signature: string;
};
export type PresetFunctions = Record<string, ArborFunction<any>>;

export function isFunction(value: unknown): value is ArborFunction<any> {
	return typeof value === 'object' && value !== null && FUNCTION_BRAND in value;
}
