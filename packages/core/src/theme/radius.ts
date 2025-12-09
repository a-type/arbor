import { Theme } from '@unocss/preset-mini';
import { themeSpacing } from './spacing';

export const themeRadius: Theme['borderRadius'] = {
	...themeSpacing,
	full: 'calc(infinity * 1px)',
};
