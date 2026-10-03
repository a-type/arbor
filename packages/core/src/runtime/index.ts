export {
	connect,
	getContext,
	getEnvValues,
	getPreset,
	getStyleSheet,
	ready,
	subscribeToEnvChanges,
} from './registration.js';
export { resolveRuntimeValue } from './resolveRuntimeValue.js';

import type { loadSimplifier as baseLoadSimplifier } from '@arbor-css/css-eval/browser';
export const loadSimplifier: typeof baseLoadSimplifier = (options) => {
	if (typeof window === 'undefined') {
		// If we're in a server-side environment, return a no-op or a placeholder
		return import('@arbor-css/css-eval/node').then(
			({ createSimplifier, transform }) =>
				createSimplifier({
					transform,
					options,
				}),
		);
	}
	// this async import boundary ensures browser-specific stuff doesn't get eagerly loaded in server-side environments
	// like SSR. It's not as 'correct' as splitting the code into separate server and browser entry points, but maybe it works for now
	// while I debug this behavior.
	return import('@arbor-css/css-eval/browser').then(({ loadSimplifier }) =>
		loadSimplifier(options),
	);
};
