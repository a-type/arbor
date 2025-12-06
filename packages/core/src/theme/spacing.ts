import { Theme } from '@unocss/preset-wind4';
import { CALCS } from '../constants/calcs';
import { PROPS } from '../constants/properties';

export const themeSpacing: Theme['spacing'] = {
	xxs: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 0.125rem)`,
	xs: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 0.25rem)`,
	sm: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 0.5rem)`,
	md: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 1rem)`,
	lg: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 1.5rem)`,
	xl: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 2rem)`,
	xxl: `calc(${CALCS.GROUP.SCALE(1 / 2)} * var(${
		PROPS.USER.SPACING_SCALE
	}) * 2.5rem)`,
};
