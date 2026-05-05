import { variantGetParameter } from '@unocss/rule-utils';
import { Variant } from 'unocss';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';

export const variantCssLayer: Variant<Theme> = {
	name: '@layer',
	match(matcher, ctx) {
		const variant = variantGetParameter(
			'@layer-',
			matcher,
			ctx.generator.config.separators,
		);
		if (variant) {
			const [match, rest] = variant;
			const layer = h.bracket(match) ?? match;
			if (layer) {
				return {
					matcher: rest,
					handle: (input, next) =>
						next({
							...input,
							parent: `${input.parent ? `${input.parent} $$ ` : ''}@layer ${layer}`,
						}),
				};
			}
		}
	},
};
