import { css } from '@arbor-css/css-eval';
import { loadSimplifier } from '@arbor-css/css-eval/browser';
import { TokenPurpose } from '@arbor-css/tokens';

export async function resolveRuntimeValue(
	tokenName: string,
	target = document.documentElement,
	options: {
		simplifierPasses?: number;
		tokenPurpose?: TokenPurpose;
	} = { simplifierPasses: 1, tokenPurpose: 'other' },
): Promise<string | null> {
	const style = getComputedStyle(target);
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
}
