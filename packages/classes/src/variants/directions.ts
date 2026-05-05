import type { Variant } from '@unocss/core';
import { variantMatcher } from '@unocss/rule-utils';
import { Theme } from '../theme/types.js';

export const variantLanguageDirections = [
	variantMatcher('rtl', (input) => ({
		prefix: `[dir="rtl"] $$ ${input.prefix}`,
	})),
	variantMatcher('ltr', (input) => ({
		prefix: `[dir="ltr"] $$ ${input.prefix}`,
	})),
] as Variant<Theme>[];
