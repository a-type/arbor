import { variantGetParameter } from '@unocss/preset-wind4/utils';
import { Variant } from 'unocss';

export const modeVariants: Variant[] = [
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
