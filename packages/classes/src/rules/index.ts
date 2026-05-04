import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { borderRules } from './border.js';
import { colorRules } from './color.js';
import { spacingRules } from './spacing.js';

export const rules: Rule<Theme>[] = [
	...colorRules,
	...spacingRules,
	...borderRules,
];
