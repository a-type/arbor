import { rules as baseRules } from '@unocss/preset-mini/rules';
import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { arrowRules } from './arrow.js';
import { borderRules } from './border.js';
import { clipPathRules } from './clip.js';
import { colorRules } from './color.js';
import { shadowRules } from './shadow.js';
import { spacingRules } from './spacing.js';
import { typographyRules } from './typography.js';

export const rules: Rule<Theme>[] = [
	...(baseRules as any),
	...shadowRules,
	...colorRules,
	...spacingRules,
	...borderRules,
	...typographyRules,
	...arrowRules,
	...clipPathRules,
];
