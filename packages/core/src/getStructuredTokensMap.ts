import { $systemProps } from '@arbor-css/globals';
import { ModeSchemaLevel } from '@arbor-css/modes';
import { ArborPreset } from '@arbor-css/preset/config';
import { isToken, Token } from '@arbor-css/tokens';

/**
 * Maps all available design system tokens to a fully qualified name (e.g. "color.main.mid")
 * and the corresponding token object. This is the central logic for deciding which tokens
 * to expose and resolve in the VS Code extension and bundler plugin.
 */
export function getStructuredTokensMap(
	preset: ArborPreset<ModeSchemaLevel, any>,
	{ delimiter = '.' } = { delimiter: '.' },
): Map<string, Token> {
	const map = new Map<string, Token>();

	// Mode tokens from base mode schema
	const modeTokens = preset?.modes?.base?.schema?.$tokens;
	if (modeTokens) {
		walkTokenTree(modeTokens, '', map, { delimiter });
	}

	// Primitive tokens — prefix with "primitives."
	const primitiveTokens = preset?.primitives?.$tokens;
	if (primitiveTokens) {
		walkTokenTree(primitiveTokens, 'primitives', map, { delimiter });
	}

	// System tokens - we only expose the "final" tokens
	walkTokenTree($systemProps, 'system', map, {
		delimiter,
		// TODO: better way to mark these - add .metadata to Token?
		filter: (token) => token.name.endsWith('final'),
		getKey: (_, key) => {
			return key === 'final' ? '' : key;
		}, // omit "final" from the path since it's redundant
	});

	return map;
}

function walkTokenTree(
	node: any,
	prefix: string,
	map: Map<string, Token>,
	options: {
		delimiter?: string;
		filter?: (token: Token, path: string) => boolean;
		getKey?: (token: Token, key: string) => string;
	},
): void {
	if (typeof node !== 'object' || node === null) return;
	const { delimiter = '.', filter, getKey = (token, key) => key } = options;

	for (const rawKey of Object.keys(node)) {
		const value = node[rawKey];
		const key = getKey(value, rawKey);
		const currentPath =
			prefix ? [prefix, key].filter((k) => !!k).join(delimiter) : key;

		if (isToken(value) && (!filter || filter(value, currentPath))) {
			map.set(currentPath, value);

			// $root tokens are also accessible at the parent path (without the .$root segment)
			if (key === '$root' && prefix) {
				map.set(prefix, value);
			}
		} else if (typeof value === 'object' && value !== null) {
			walkTokenTree(value, currentPath, map, options);
		}
	}
}
