import { getAutoEnv } from './env.js';
import { Css } from './interpolation.js';
import {
	isSingleValue,
	unwrapDummyAssignment,
	wrapWithDummyAssignment,
} from './util.js';

export interface CssResolutionContext {
	propertyValues?: Record<string, string | Css>;
	skipBaking?: boolean;
}

export async function resolveCss(
	input: Css,
	{ propertyValues = {}, skipBaking = false }: CssResolutionContext = {},
) {
	const transform = await getAutoEnv();

	// input could be a single value, in which case we must
	// construct a dummy assignment to make it parseable.
	let cssToTransform = input.text;
	const isSingle = isSingleValue(cssToTransform);
	if (isSingle) {
		cssToTransform = wrapWithDummyAssignment(cssToTransform);
	}

	const result = await transform({
		filename: 'input.css',
		code: cssToTransform,
		minify: true,
		visitor: {
			// substitute known variables with their values
			Variable(variable) {
				if (skipBaking) {
					return { type: 'var', value: variable };
				}

				const name = variable.name.ident;
				const value = propertyValues[name];
				if (value) {
					if (typeof value === 'string') {
						return { raw: value };
					} else if ('text' in value && 'tokens' in value) {
						return { raw: value.text };
					}
				}

				return { type: 'var', value: variable };
			},
		},
	});

	if (isSingle) {
		return unwrapDummyAssignment(result.code);
	}

	return result.code;
}
