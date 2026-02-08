import { Theme } from '@unocss/preset-mini';
import { PROPS } from '../constants/properties';

export const themeSpacing: Theme['spacing'] = {
	none: '0px',
	xxs: `calc(var(${PROPS.USER.SPACING_SCALE}) * 0.125rem)`,
	xs: `calc(var(${PROPS.USER.SPACING_SCALE}) * 0.25rem)`,
	sm: `calc(var(${PROPS.USER.SPACING_SCALE}) * 0.5rem)`,
	md: `calc(var(${PROPS.USER.SPACING_SCALE}) * 1rem)`,
	lg: `calc(var(${PROPS.USER.SPACING_SCALE}) * 1.5rem)`,
	xl: `calc(var(${PROPS.USER.SPACING_SCALE}) * 2rem)`,
	xxl: `calc(var(${PROPS.USER.SPACING_SCALE}) * 2.5rem)`,
};
themeSpacing['DEFAULT'] = themeSpacing.md;
