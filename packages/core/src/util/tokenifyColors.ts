import { createToken } from '@arbor-css/tokens';
import { convertStructure } from './convertStructure.js';

/**
 * Replaces each level of a structure of color strings
 * with a color Token
 */
export function tokenifyColors<T extends Record<string, any>>(obj: T): any {
	return convertStructure(
		obj,
		(item: any, path: (string | number)[]): item is string =>
			typeof item === 'string',
		(item: string, path: (string | number)[]) =>
			createToken(path.join('-'), { type: 'color' }),
	);
}
