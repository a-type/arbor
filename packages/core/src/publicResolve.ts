// the "public" version of resolveCss automatically detects and loads
// the proper transform function, but to do so it must be async.

import {
	resolveCss as baseResolveCss,
	Css,
	CssResolutionContext,
} from '@arbor-css/css-eval';

export async function resolveCss(
	css: Css,
	context: Omit<CssResolutionContext, 'simplifier'> & {
		simplify?: boolean;
	},
) {
	const isBrowser =
		typeof window !== 'undefined' && typeof window.document !== 'undefined';
	const simplifier =
		context.simplify === false ? undefined
		: isBrowser ? (await import('@arbor-css/css-eval/browser')).loadSimplifier()
		: (await import('@arbor-css/css-eval/node')).simplifier;

	return baseResolveCss(css, { ...context, simplifier: await simplifier });
}
