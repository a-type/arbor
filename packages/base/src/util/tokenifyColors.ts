import { createToken } from '@arbor-css/tokens';

/**
 * Replaces each level of a structure of color strings
 * with a color Token
 */
export function tokenifyColors<T extends Record<string, any>>(
	obj: T,
	prefix: string[] = [],
): any {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => {
			const currentPath = [...prefix, key];
			if (typeof value === 'string') {
				const propName = currentPath.join('-');
				return [key, createToken(propName, { type: 'color' })];
			} else if (typeof value === 'object' && value !== null) {
				return [key, tokenifyColors(value, currentPath)];
			} else {
				throw new Error(`Invalid color value at ${currentPath.join('.')}`);
			}
		}),
	);
}
