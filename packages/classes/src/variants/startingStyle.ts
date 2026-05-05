import type { Variant } from '@unocss/core';
import { Theme } from 'unocss/preset-mini';

export const variantStartingStyle: Variant<Theme> = {
	name: 'starting',
	match(matcher) {
		if (!matcher.startsWith('starting:')) return;

		return {
			matcher: matcher.slice(9),
			handle: (input, next) =>
				next({
					...input,
					parent: `@starting-style`,
				}),
		};
	},
};
