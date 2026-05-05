import type { Variant } from '@unocss/core';
import { variantMatcher } from '@unocss/rule-utils';
import { Theme } from '../theme/types.js';

export const variantChildren: Variant<Theme>[] = [
	variantMatcher('*', (input) => ({ selector: `${input.selector} > *` }), {
		order: -1,
	}),
	variantMatcher('**', (input) => ({ selector: `${input.selector} *` }), {
		order: -1,
	}),
];
