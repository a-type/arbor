import { css } from '@arbor-css/css-eval';
import type { loadSimplifier as loadSimplifierFn } from '@arbor-css/css-eval/browser';
import { TokenPurpose } from '@arbor-css/tokens';

export function makeResolveRuntimeValue(
	loadSimplifier: typeof loadSimplifierFn,
) {
	return async function resolveRuntimeValue(
		tokenName: string,
		options: {
			target?: HTMLElement;
			simplifierPasses?: number;
			tokenPurpose?: TokenPurpose;
		} = { simplifierPasses: 1, tokenPurpose: 'other' },
	): Promise<string | null> {
		const style = getComputedStyle(options.target ?? document.documentElement);
		const value = style.getPropertyValue(tokenName).trim();

		if (!value) {
			return null;
		}

		const simplifier = await loadSimplifier({
			passes: options.simplifierPasses ?? 1,
		});
		const simplified = simplifier(
			css`
				${value}
			`,
			{ purpose: options.tokenPurpose },
		);
		return simplified;
	};
}
