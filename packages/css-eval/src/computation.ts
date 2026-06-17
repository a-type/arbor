import { TokenPurpose } from '@arbor-css/tokens';
import { Css } from './interpolation.js';
import { CssEnvValues, resolveEnv } from './resolveEnv.js';
import { resolveProperties } from './resolveProperties.js';
import { CssSimplifier } from './simplification.js';

export interface CssResolutionContext {
	/**
	 * Known property values to resolve and bake into the CSS. This is used to
	 * simplify output CSS where the dependencies of a value are known and
	 * hard-coded; for example, other values present in a mode.
	 */
	propertyValues?: Record<string, string | Css>;
	/**
	 * Values from the runtime environment may be used to resolve and
	 * simplify runtime-known CSS value types like vw, vh, rem, etc.
	 * NOT meant for use in generating CSS for application; only really
	 * relevant for interactive tooling and introspection purposes.
	 */
	envValues?: CssEnvValues;
	/**
	 * Skip applying known property values and env values
	 */
	skipBaking?: boolean;
	/**
	 * Optional; provide a simplifier implementation to reduce the size and complexity
	 * of the final CSS by pre-computing arithmetic and simplifying expressions.
	 */
	simplifier?: CssSimplifier;
	/**
	 * Optional; helps tune simplification for particular CSS value types.
	 */
	purpose?: TokenPurpose;
}

export function resolveCss(
	input: Css,
	{
		propertyValues = {},
		envValues = {},
		skipBaking = false,
		simplifier,
		purpose,
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
