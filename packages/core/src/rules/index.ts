import { rules as baseRules } from '@unocss/preset-mini/rules';
import { Rule } from 'unocss';
import { colorRules } from './color';
import { radiusRules } from './radius';
import { spacingRules } from './spacing';

export const rules: Rule[] = [
	...baseRules,
	...colorRules,
	...spacingRules,
	...radiusRules,
];
