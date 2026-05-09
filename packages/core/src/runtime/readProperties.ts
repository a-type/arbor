import { isToken, TokenSchema } from '@arbor-css/tokens';
import { convertStructure } from '@arbor-css/util';

export function readProperties(
	tokens: TokenSchema,
	target = document.documentElement,
): Record<string, any> {
	return convertStructure(tokens, isToken, (token) => {
		return getComputedStyle(target).getPropertyValue(token.name).trim();
	});
}
