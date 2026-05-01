import { variants as windVariants } from '@unocss/preset-wind4';
import { modeVariants } from './mode.js';
import { stuckVariant } from './stuck.js';

export const variants = [...windVariants({}), ...modeVariants, stuckVariant];
