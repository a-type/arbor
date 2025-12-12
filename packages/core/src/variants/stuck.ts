import { Theme } from '@unocss/preset-mini';
import { variantGetParameter } from '@unocss/preset-mini/utils';
import { Variant } from 'unocss';

export const stuckVariant: Variant<Theme> = {
	name: 'stuck',
	match(input, ctx) {
		const variant = variantGetParameter(
			'stuck-',
			input,
			ctx.generator.config.separators,
		);
		if (variant) {
			const [match, rest] = variant;
			const [nameOrType, maybeType] = match.split('/');
			const type = maybeType ?? nameOrType;
			const name = maybeType ? nameOrType : undefined;
			return {
				matcher: rest,
				handle: (input, next) =>
					next({
						...input,
						parent: `${input.parent ? `${input.parent} $$ ` : ''}@container${
							name ? ` ${name}` : ''
						} scroll-state(stuck: ${
							type === 'start' || type === 'top' ? 'top' : 'block-end'
						})`,
					}),
			};
		}
	},
	autocomplete: [
		'stuck-(start|top|end|bottom)',
		'stuck-<name>/(start|top|end|bottom)',
	],
};
