import { Theme } from '@unocss/preset-mini';
import { h, variantGetParameter } from '@unocss/preset-mini/utils';
import { Variant } from 'unocss';
import { PROPS } from '../constants/properties';

export const paletteVariant: Variant<Theme> = {
	name: 'palette',
	match(input, ctx) {
		const variant = variantGetParameter(
			'palette-',
			input,
			ctx.generator.config.separators,
		);
		console.log('palette variant match', input, variant);
		if (variant) {
			const [match, rest] = variant;
			return {
				matcher: rest,
				handle: (input, next) =>
					next({
						...input,
						parent: `${
							input.parent ? `${input.parent} $$ ` : ''
						}@container style(${PROPS.PALETTE.NAME}: ${
							h.bracket(match) ?? match
						})`,
					}),
			};
		}
	},
	autocomplete: 'palette-<name>',
};
