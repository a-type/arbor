import { Rule } from 'unocss';

export const touchActionRules: Rule[] = [
	[
		/^touch-(none|auto|pan-x|pan-y|manipulation)$/,
		([, value]) => ({ 'touch-action': value }),
	],
];
