import { CreateToken, Token, TokenPurpose } from './createToken.js';

/**
 * Simple token syntax for end users to quickly and easily
 * define tokens without worrying about naming conventions,
 * prefixes, etc.
 *
 * Used in all public-facing token creation: modes, mixin contributions, etc.
 */

/**
 * Defines the purpose of a token.
 */
export type SimpleTokenDefinition = TokenPurpose;

/**
 * A structured object of tokens.
 */
export type SimpleTokenSchema = {
	/**
	 * Special key: creates a token at the current group path without appending
	 * a `-$root` segment. For example, `{ colors: { main: { $root: 'color', mid: 'color' } } }`
	 * generates `--$-colors-main` (for `$root`) and `--$-colors-main-mid` (for `mid`).
	 * Optional at any level.
	 */
	$root?: SimpleTokenDefinition;
	[key: string]: SimpleTokenDefinition | SimpleTokenSchema | undefined;
};

export type SimpleTokensAsTokenDefinitions<T extends SimpleTokenSchema> =
	T extends object ?
		{
			[P in keyof T]: NonNullable<T[P]> extends string ? Token
			: NonNullable<T[P]> extends object ?
				SimpleTokensAsTokenDefinitions<NonNullable<T[P]>>
			:	never;
		}
	:	never;

function isProbablySimpleTokenDefinition(
	value: any,
): value is SimpleTokenDefinition {
	return value && typeof value === 'string';
}

function convertSimpleToken(
	name: string,
	prop: SimpleTokenDefinition,
	createTokenValue: CreateToken,
	group?: string,
): Token {
	return createTokenValue(name, { purpose: prop, group });
}

/**
 * Converts simple, data-only, user-provided token definitions into
 * full-fledged Tokens, retaining object structure
 */
export function convertSimpleTokenSchema<T extends SimpleTokenSchema>(
	root: T,
	tag: string,
	createTokenValue: CreateToken,
): SimpleTokensAsTokenDefinitions<T> {
	function generatePropsForSchemaLevel(
		schemaLevel: any,
		propPrefix: string,
	): any {
		const propsLevel: any = {};
		for (const key in schemaLevel) {
			const value = schemaLevel[key];
			if (key === '$root') {
				// $root generates a token at the current group path (no segment appended)
				if (isProbablySimpleTokenDefinition(value)) {
					propsLevel.$root = convertSimpleToken(
						propPrefix,
						value,
						createTokenValue,
						propPrefix,
					);
				}
				continue;
			}
			const currentPrefix = [propPrefix, key].filter(Boolean).join('-');
			if (isProbablySimpleTokenDefinition(value)) {
				const propertyDefinition = convertSimpleToken(
					currentPrefix,
					value,
					createTokenValue,
					propPrefix,
				);
				propsLevel[key] = propertyDefinition;
			} else if (typeof value === 'object' && value !== null) {
				propsLevel[key] = generatePropsForSchemaLevel(value, currentPrefix);
			}
		}
		return propsLevel;
	}
	return generatePropsForSchemaLevel(root, tag);
}
