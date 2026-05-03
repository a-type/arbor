import {
	rules as baseRules,
	bgColors,
	fonts,
	gaps,
	margins,
	paddings,
	placeholders,
} from '@unocss/preset-wind4/rules';
import { Rule } from 'unocss';
import { colorRules } from './color.js';
import { spacingRules } from './spacing.js';

// excluding text-$color and color/c-$color rules which conflict with our color system
const textColorRule = fonts.find(
	([pattern]) =>
		typeof pattern !== 'string' &&
		(pattern.source === '^text-(?:color-)?(.+)$' ||
			pattern.source === '^^(?:color|c)-(.+)$'),
)!;

const excluded = new Set<Rule>([
	textColorRule,
	...bgColors,
	...placeholders,
	...margins,
	...paddings,
	...gaps,
]);

export const rules: Rule[] = [
	...baseRules.filter((rule) => !excluded.has(rule)),
	...colorRules,
	...spacingRules,
];
