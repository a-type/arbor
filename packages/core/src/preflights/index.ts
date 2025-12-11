import { colorPreflight, ColorPreflightOptions } from './colors';
import { modePreflight } from './mode';
import { propertiesPreflight } from './properties';
import { resetPreflight } from './reset';
import { userPreflight, UserPreflightOptions } from './user';

export interface AllPreflightOptions
	extends ColorPreflightOptions,
		UserPreflightOptions {}

export const preflights = (options: AllPreflightOptions) => [
	resetPreflight,
	propertiesPreflight,
	colorPreflight(options),
	modePreflight(options),
	userPreflight(options),
];
