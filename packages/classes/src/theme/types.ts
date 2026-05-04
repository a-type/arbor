import { TokenPurpose } from '@arbor-css/core';

export type Theme = {
	[Purpose in TokenPurpose]: Record<string, string>;
};
