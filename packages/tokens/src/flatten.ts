import { isToken, Token } from './createToken.js';

export function flattenTokenSchema(obj: any): Token[] {
	const propsList: Token[] = [];
	for (const key in obj) {
		if (isToken(obj[key])) {
			propsList.push(obj[key]);
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			propsList.push(...flattenTokenSchema(obj[key]));
		}
	}
	return propsList;
}
