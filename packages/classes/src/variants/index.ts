import { variants as windVariants } from '@unocss/preset-wind4';
import { modeVariants } from './mode';
import { stuckVariant } from './stuck';

export const variants = [...windVariants({}), ...modeVariants, stuckVariant];
