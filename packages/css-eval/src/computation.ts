import { Css } from './interpolation.js';
import { resolveProperties } from './resolveProperties.js';
import { CssSimplifier } from './simplification.js';

export interface CssResolutionContext {
	propertyValues?: Record<string, string | Css>;
	skipBaking?: boolean;
	simplifier?: CssSimplifier;
}

export function resolveCss(
	input: Css,
	{ propertyValues = {}, skipBaking = false, simplifier }: CssResolutionContext,
) {
	let result =
		skipBaking ? input.text : resolveProperties(input, propertyValues).text;

	if (simplifier) {
		result = simplifier({
			...input,
			text: result,
		});
	}

	return result;
}
