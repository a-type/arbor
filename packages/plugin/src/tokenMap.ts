import { isToken, type Token } from '@arbor-css/tokens';

export interface TokenMapEntry {
	/** The CSS var() expression, e.g. `var(--Ⓜ️-color-main-mid)` */
	cssVar: string;
	/** Raw CSS custom property name, e.g. `--Ⓜ️-color-main-mid` */
	name: string;
	/** Token purpose (color, spacing, etc.) */
	purpose: Token['purpose'];
}

/** Flat map from dot-path string to token info */
export type TokenMap = Map<string, TokenMapEntry>;

/**
 * Builds a flat Map<dotPath, TokenMapEntry> from a preset.
 *
 * Mode tokens are registered under their plain path (e.g. "color.main.mid").
 * Primitive tokens are registered under "primitives.x.y" (e.g. "primitives.spacing.md").
 */
export function buildTokenMap(preset: any): TokenMap {
	const map: TokenMap = new Map();

	// Mode tokens from base mode schema
	const modeTokens = preset?.modes?.base?.schema?.$tokens;
	if (modeTokens) {
		walkTokenTree(modeTokens, '', map);
	}

	// Primitive tokens — prefix with "primitives."
	const primitiveTokens = preset?.primitives?.$tokens;
	if (primitiveTokens) {
		walkTokenTree(primitiveTokens, 'primitives', map);
	}

	return map;
}

function walkTokenTree(node: any, prefix: string, map: TokenMap): void {
	if (typeof node !== 'object' || node === null) return;

	for (const key of Object.keys(node)) {
		const value = node[key];
		const currentPath = prefix ? `${prefix}.${key}` : key;

		if (isToken(value)) {
			const entry: TokenMapEntry = {
				cssVar: value.var,
				name: value.name,
				purpose: value.purpose,
			};
			map.set(currentPath, entry);

			// $root tokens are also accessible at the parent path (without the .$root segment)
			if (key === '$root' && prefix) {
				map.set(prefix, entry);
			}
		} else if (typeof value === 'object' && value !== null) {
			walkTokenTree(value, currentPath, map);
		}
	}
}
