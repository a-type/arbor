import {
	rules as baseRules,
	containerParent,
	fontStyles,
	margins,
	paddings,
} from '@unocss/preset-mini/rules';
import { Rule } from 'unocss';
import { anchorRules } from './anchor';
import { colorRules } from './color';
import { containerRules } from './container';
import { groupRules } from './group';
import { radiusRules } from './radius';
import { spacingRules } from './spacing';

const textColorRule = fontStyles.find(
	([pattern]) =>
		typeof pattern !== 'string' && pattern.source === '^text-(?:color-)?(.+)$',
)!;

const excluded = new Set<Rule>([
	...paddings,
	...margins,
	...containerParent,
	textColorRule,
]);

export const rules: Rule[] = [
	...baseRules.filter((rule) => !excluded.has(rule)),
	...colorRules,
	...groupRules,
	...spacingRules,
	...radiusRules,
	...containerRules,
	...anchorRules,
];
