import { TokenSchema } from '@arbor-css/tokens';
import { flattenAndApplyTokenValues } from './flattenAndApplyTokenValues.js';
import { formatObjectToCss } from './formatObjectToCss.js';

export function printTokens(
	tokens: TokenSchema,
	values: Record<string, any>,
	{ prefix }: { prefix?: string } = {},
) {
	return formatObjectToCss(
		flattenAndApplyTokenValues(tokens, values, { prefix }),
	);
}
