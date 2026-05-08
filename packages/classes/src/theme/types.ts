import { TokenPurpose } from '@arbor-css/core';

export type Theme = {
	[Purpose in TokenPurpose]: Record<string, string>;
} & {
	breakpoints: Record<string, string>;
	verticalBreakpoints: Record<string, string>;
	containers: Record<string, string>;
} & {
	[K in string]: any;
};
