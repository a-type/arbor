import {
	rules as baseRules,
	margins,
	paddings,
} from '@unocss/preset-mini/rules';
import { Rule } from 'unocss';
import { colorRules } from './color';
import { groupRules } from './group';
import { radiusRules } from './radius';
import { spacingRules } from './spacing';

const excluded = new Set<Rule>([...paddings, ...margins]);

export const rules: Rule[] = [
	...baseRules.filter((rule) => !excluded.has(rule)),
	...colorRules,
	...groupRules,
	...spacingRules,
	...radiusRules,
];
