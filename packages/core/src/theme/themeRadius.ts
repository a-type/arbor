import { Theme } from '@unocss/preset-wind4';
import { CALCS } from '../constants/calcs';

export const themeRadius: Theme['radius'] = {
	none: '0px',
	xxs: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 0.125rem)`,
	xs: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 0.25rem)`,
	sm: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 0.5rem)`,
	md: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 1rem)`,
	lg: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 1.5rem)`,
	xl: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 2rem)`,
	xxl: `calc(${CALCS.GROUP.SCALE(1 / 2)} * 2.5rem)`,
	full: 'calc(infinity * 1px)',
};
