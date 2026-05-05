import { variantGetParameter } from '@unocss/rule-utils';
import { Variant } from 'unocss';
import { Theme } from '../theme/types.js';

export const modeVariants: Variant<Theme>[] = [
	{
		name: '@mode',
		match(input, ctx) {
			const variant = variantGetParameter(
				'@mode-',
				input,
				ctx.generator.config.separators,
			);
			if (variant) {
				const [match, rest] = variant;
				return {
					matcher: rest,
					handle: (input, next) =>
						next({
							...input,
							parent: `${input.parent ? `${input.parent} $$ ` : ''}.\\@mode-${match}`,
						}),
				};
			}
		},
		autocomplete: ['@mode-$modeName'],
	},
];
