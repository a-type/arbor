import {
	$,
	CalcInterpolation,
	CalcOperations,
	computeEquation,
	css,
	Css,
	type Equation,
	printComputationResult,
	printEquation,
} from '@arbor-css/calc';
import { DEFAULT_TOKEN_PREFIX, isToken } from '@arbor-css/tokens';

export const FUNCTION_PREFIX = `${DEFAULT_TOKEN_PREFIX}fn-`;

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
export function createFunctionFactory({
	tokenPrefix = DEFAULT_TOKEN_PREFIX,
}: {
	tokenPrefix?: string;
} = {}) {
	const functionPrefix = `${tokenPrefix}fn-`;

	return function createFunction<TParams extends FunctionParams>(
		name: string,
		{
			description,
			parameters,
			definition,
		}: {
			description?: string;
			parameters: TParams;
			definition: (
				css: Css & CalcOperations,
				...params: CalcInterpolation[]
			) => Equation;
		},
	): ArborFunction<TParams> {
		const cssName = `${functionPrefix}${name}`;
		const definitionTools = Object.assign(css, $) as Css & CalcOperations;
		const parameterNames = parameters.map((parameter) =>
			isToken(parameter) ? parameter.name : parameter,
		);

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

		const equation = definition(
			definitionTools,
			...parameterNames.map((parameter) => $.val(`var(${parameter})`)),
		);
		const body = printEquation(equation);
		const cssDefinition = `@function ${cssName}(${paramsList}) { result: ${body}; }`;

		return {
			[FUNCTION_BRAND]: true as const,
			name: cssName,
			description,
			parameters,
			equation,
			definition: cssDefinition,
			inline: (...params: ParamsAsInterpolations<TParams>) =>
				definition(definitionTools, ...params),
			compute(params: Record<string, string | number>): string {
				const propertyValues: Record<string, string> = {};
				for (let index = 0; index < parameters.length; index++) {
					const parameter = parameters[index];
					const cssParameterName = parameterNames[index];
					const logicalName =
						isToken(parameter) && cssParameterName.startsWith(tokenPrefix) ?
							cssParameterName.slice(tokenPrefix.length)
						:	cssParameterName.replace(/^--/, '');
					if (logicalName in params) {
						propertyValues[cssParameterName] = String(params[logicalName]);
					}
				}
				const result = computeEquation(equation, {
					propertyValues,
					skipBaking: false,
				});
				return printComputationResult(result);
			},
		};
	};
}

export type CreateFunction = ReturnType<typeof createFunctionFactory>;

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
export type PresetFunctions = Record<string, ArborFunction<any>>;

export function isFunction(value: unknown): value is ArborFunction {
	return typeof value === 'object' && value !== null && FUNCTION_BRAND in value;
}
