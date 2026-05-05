import { TokenPurpose } from '@arbor-css/core';

export type Theme = {
	[Purpose in TokenPurpose]: Record<string, string>;
} & {
	breakpoint: Record<string, string>;
	verticalBreakpoint: Record<string, string>;
	container: Record<string, string>;
} & {
	[K in string]: Record<string, string> | string;
};
