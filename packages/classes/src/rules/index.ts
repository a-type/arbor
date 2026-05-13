import { ArborPreset } from '@arbor-css/core';
import { rules as miniRules, rings } from '@unocss/preset-mini/rules';
import { Rule } from 'unocss';
import { Theme } from '../theme/types.js';
import { arrowRules } from './arrow.js';
import { borderRules } from './border.js';
import { clipPathRules } from './clip.js';
import { colorRules } from './color.js';
import { createModeRules } from './mode.js';
import { ringRules } from './ring.js';
import { shadowRules } from './shadow.js';
import { spacingRules } from './spacing.js';
import { touchActionRules } from './touchAction.js';
import { transforms } from './transform.js';
import { typographyRules } from './typography.js';

// rules which aren't fully shadowed by ours but conflict in meaning
const excludeRules = new Set([...rings]);

const baseRules = miniRules.filter((rule) => !excludeRules.has(rule));

export const createRules = (preset: ArborPreset<any, any>): Rule<Theme>[] => [
	...(baseRules as any),
	...createModeRules(preset),
	...shadowRules,
	...colorRules,
	...ringRules,
	...spacingRules,
	...borderRules,
	...typographyRules,
	...arrowRules,
	...clipPathRules,
	...transforms,
	...touchActionRules,
];
