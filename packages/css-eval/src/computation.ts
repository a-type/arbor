import { Css } from './interpolation.js';
import { CssEnvValues, resolveEnv } from './resolveEnv.js';
import { resolveProperties } from './resolveProperties.js';
import { CssSimplifier } from './simplification.js';

export interface CssResolutionContext {
	propertyValues?: Record<string, string | Css>;
	envValues?: CssEnvValues;
	skipBaking?: boolean;
	simplifier?: CssSimplifier;
}

export function resolveCss(
	input: Css,
	{
		propertyValues = {},
		envValues = {},
		skipBaking = false,
		simplifier,
	}: CssResolutionContext,
) {
	let result =
		skipBaking ?
			input.text
		:	resolveEnv(resolveProperties(input, propertyValues), envValues).text;

	if (simplifier) {
		result = simplifier({
			...input,
			text: result,
		});
	}

	return result;
}
