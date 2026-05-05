import type { VariantObject } from '@unocss/core';
import { variantGetParameter } from '@unocss/rule-utils';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';

export const variantSupports: VariantObject<Theme> = {
	name: 'supports',
	match(matcher, ctx) {
		const variant = variantGetParameter(
			'supports-',
			matcher,
			ctx.generator.config.separators,
		);
		if (variant) {
			const [match, rest] = variant;

			let supports = h.bracket(match) ?? '';

			if (supports) {
				if (!(supports.startsWith('(') && supports.endsWith(')'))) {
					supports = `(${supports})`;
				}

				return {
					matcher: rest,
					handle: (input, next) =>
						next({
							...input,
							parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports ${supports}`,
						}),
				};
			}
		}
	},
	multiPass: true,
};
