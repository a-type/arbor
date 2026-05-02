import { Token, TokenSchema, tokenSchemaToList } from '@arbor-css/tokens';

export function groupTokens(tokens: TokenSchema) {
	const asList = tokenSchemaToList(tokens);

	const groupedSimpleTokens = asList.reduce(
		(groups, token) => {
			const purpose = token.purpose;
			if (purpose.startsWith('font') || purpose === 'line-height') {
				// fonts handled separately
				return groups;
			}
			if (!groups[purpose]) {
				groups[purpose] = [];
			}
			groups[purpose].push(token);
			return groups;
		},
		{} as Record<string, Token[]>,
	);

	const typographyTokens = asList
		.filter(
			(token) =>
				token.purpose.startsWith('font') || token.purpose === 'line-height',
		)
		.reduce(
			(levels, token) => {
				// this is kind of an assumption, structure of token ends with level
				const level = token.group ?? 'unknown';
				if (!levels[level]) {
					levels[level] = {};
				}
				if (token.purpose === 'font-size') {
					levels[level].size = token;
				} else if (token.purpose === 'font-weight') {
					levels[level].weight = token;
				} else if (token.purpose === 'line-height') {
					levels[level].lineHeight = token;
				}
				return levels;
			},
			{} as Record<
				string,
				{
					size?: Token;
					weight?: Token;
					lineHeight?: Token;
				}
			>,
		);

	return { simple: groupedSimpleTokens, typography: typographyTokens };
}
