import { variants as baseVariants } from '@unocss/preset-mini/variants';
import { variantContainerQuery } from './container.js';
import { variantInert } from './inert.js';
import { modeVariants } from './mode.js';
import { stuckVariant } from './stuck.js';

export const variants = [
	...(baseVariants({
		arbitraryVariants: true,
		variablePrefix: '🤵',
	}) as any),
	stuckVariant,
	variantInert,
	variantContainerQuery,
	...modeVariants,
];
