import type { VariantObject } from '@unocss/core';
import { variantGetParameter } from '@unocss/rule-utils';
import { Theme } from '../theme/types.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

export const variantContainerQuery: VariantObject<Theme> = {
	name: '@',
	match(matcher, ctx) {
		if (matcher.startsWith('@container')) return;

		const variant = variantGetParameter(
			'@',
			matcher,
			ctx.generator.config.separators,
		);
		if (variant) {
			const [match, rest, label] = variant;

			const [container] = themeOrLiteral(match, ctx.theme, {
				startFrom: 'container',
				trySuffixes: ['-width'],
			});

			if (container) {
				let order =
					1000 + Object.keys(ctx.theme.container ?? {}).indexOf(match);

				if (label) order += 1000;

				return {
					matcher: rest,
					handle: (input, next) =>
						next({
							...input,
							parent: `${input.parent ? `${input.parent} $$ ` : ''}@container${label ? ` ${label} ` : ' '}(min-width: ${container})`,
							parentOrder: order,
						}),
				};
			}
		}
	},
	multiPass: true,
};
