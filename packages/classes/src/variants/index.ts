import { variants as windVariants } from '@unocss/preset-wind4';
import { stuckVariant } from './stuck';

export const variants = [...windVariants({}), stuckVariant];
