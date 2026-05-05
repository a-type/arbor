import { variants as baseVariants } from '@unocss/preset-mini/variants';
import { variantContainerQuery } from './container.js';
import { modeVariants } from './mode.js';
import { variantStartingStyle } from './startingStyle.js';
import { stuckVariant } from './stuck.js';

export const variants = [
	...(baseVariants({}) as any),
	stuckVariant,
	variantContainerQuery,
	variantStartingStyle,
	...modeVariants,
];
