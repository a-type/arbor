import { isToken, TokenSchema } from '@arbor-css/tokens';

export function flattenAndApplyTokenValues(
	tokens: TokenSchema,
	values: Record<string, any>,
	{ prefix }: { prefix?: string } = {},
) {
	const result: Record<string, string> = {};
	function walk(
		tokenNode: Record<string, any>,
		valueNode: Record<string, any>,
		path: string[] = [],
	) {
		for (const key in tokenNode) {
			const tokenCurrent = tokenNode[key];
			if (!valueNode[key]) {
				throw new Error(
					`Missing value for token ${tokenCurrent.name} at path ${[...path, key].join('.')} (values: ${JSON.stringify(valueNode)})`,
				);
			}
			const valueCurrent = valueNode[key];
			const currentPath = [...path, key];
			if (isToken(tokenCurrent)) {
				const tokenValue = valueCurrent as string;
				if (tokenValue === undefined) {
					throw new Error(
						`Missing value for token ${tokenCurrent.name} at ${currentPath.join('.')} (values: ${JSON.stringify(valueNode)})`,
					);
				}
				if (prefix) {
					result[tokenCurrent.prefixed(prefix).name] = tokenValue;
				} else {
					result[tokenCurrent.name] = tokenValue;
				}
			} else if (typeof tokenCurrent === 'object') {
				walk(tokenCurrent, valueCurrent, currentPath);
			}
		}
	}
	walk(tokens, values);
	return result;
}
