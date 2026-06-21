import {
	CreateToken,
	isToken,
	Token,
	TokenOptions,
	TokenPurpose,
} from './createToken.js';

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
export type SimpleTokenDefinition =
	| TokenPurpose
	| {
			purpose: TokenPurpose;
			description?: string;
			inherits?: boolean;
	  }
	| Token;

type SimpleTokenDefinitionObject = Exclude<SimpleTokenDefinition, TokenPurpose>;

type NestedSimpleTokenSchema<T> =
	T extends SimpleTokenDefinitionObject ? never
	: T extends SimpleTokenSchema ? T
	: never;

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
			: NonNullable<T[P]> extends SimpleTokenDefinitionObject ? Token
			: NonNullable<T[P]> extends Token ? Token
			: SimpleTokensAsTokenDefinitions<
					NestedSimpleTokenSchema<NonNullable<T[P]>>
				>;
		}
	:	never;

function isProbablySimpleTokenDefinition(
	value: any,
): value is SimpleTokenDefinition {
	return (
		value &&
		!isToken(value) &&
		(typeof value === 'string' ||
			(typeof value === 'object' &&
				'purpose' in value &&
				typeof value.purpose === 'string'))
	);
}

function getSimpleTokenPurpose(value: SimpleTokenDefinition): TokenPurpose {
	return typeof value === 'string' ? value : value.purpose;
}

function getSimpleTokenDescription(
	value: SimpleTokenDefinition,
): string | undefined {
	return typeof value === 'string' ? undefined : value.description;
}

function getSimpleTokenInherits(
	value: SimpleTokenDefinition,
): boolean | undefined {
	return typeof value === 'string' ? undefined : value.inherits;
}

function convertSimpleToken(
	name: string,
	prop: SimpleTokenDefinition,
	createTokenValue: CreateToken,
	group?: string,
	applyMeta?: Partial<TokenOptions>,
): Token {
	if (isToken(prop)) {
		return prop;
	}
	return createTokenValue(name, {
		purpose: getSimpleTokenPurpose(prop),
		description: getSimpleTokenDescription(prop),
		group,
		inherits: getSimpleTokenInherits(prop),
		...applyMeta,
	});
}

/**
 * Converts simple, data-only, user-provided token definitions into
 * full-fledged Tokens, retaining object structure
 */
export function convertSimpleTokenSchema<T extends SimpleTokenSchema>(
	root: T,
	tag: string,
	createTokenValue: CreateToken,
	applyMeta?: Partial<TokenOptions>,
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
						applyMeta,
					);
				} else if (isToken(value)) {
					propsLevel.$root = value;
				} else {
					throw new Error(
						`Invalid $root token definition at ${propPrefix}: ${JSON.stringify(
							value,
						)}`,
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
					applyMeta,
				);
				propsLevel[key] = propertyDefinition;
			} else if (isToken(value)) {
				propsLevel[key] = value;
			} else if (typeof value === 'object' && value !== null) {
				propsLevel[key] = generatePropsForSchemaLevel(value, currentPrefix);
			}
		}
		return propsLevel;
	}
	return generatePropsForSchemaLevel(root, tag);
}
