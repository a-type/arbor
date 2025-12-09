import { colorPreflight, ColorPreflightOptions } from './colors';
import { modePreflight } from './mode';
import { resetPreflight } from './reset';
import { userPreflight, UserPreflightOptions } from './user';

export interface AllPreflightOptions
	extends ColorPreflightOptions,
		UserPreflightOptions {}

export const preflights = (options: AllPreflightOptions) => [
	resetPreflight,
	colorPreflight(options),
	modePreflight,
	userPreflight(options),
];
