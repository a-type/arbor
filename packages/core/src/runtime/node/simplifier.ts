import { CssSimplificationOptions } from '@arbor-css/css-eval';
import { createSimplifier, transform } from '@arbor-css/css-eval/node';

export async function loadSimplifier(options?: CssSimplificationOptions) {
	return createSimplifier({
		transform,
		options,
	});
}
