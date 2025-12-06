import { colorPreflight, ColorPreflightOptions } from './colors';
import { modePreflight } from './mode';
import { spacingPreflight, SpacingPreflightOptions } from './spacing';
import { userPreflight, UserPreflightOptions } from './user';

export interface AllPreflightOptions
	extends ColorPreflightOptions,
		UserPreflightOptions,
		SpacingPreflightOptions {}

export const preflights = (options: AllPreflightOptions) => [
	colorPreflight(options),
	modePreflight,
	spacingPreflight(options),
	userPreflight(options),
];
