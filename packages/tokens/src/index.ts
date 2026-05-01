export const TOKEN_PREFIX = '--🎨';

/**
 * Allowed types of properties - specifying one allows defining
 * a custom property in CSS which enables interpolation in animations
 * and other optimizations.
 *
 * "*" doesn't really do much but does allow any kind of value.
 *
 * "computed" will not generate a property definition and is assumed
 * to be a complex CSS property value like calc() or other things.
 */
export type PropertyType =
	| 'angle'
	| 'color'
	| 'custom-ident'
	| 'image'
	| 'integer'
	| 'length'
	| 'length-percentage'
	| 'number'
	| 'percentage'
	| 'resolution'
	| 'string'
	| 'time'
	| 'transform-function'
	| 'transform-list'
	| 'url'
	| '*';

const TOKEN_BRAND = '@@TOKEN@@';

export function createToken(
	name: string,
	{
		type,
		fallback,
		inherits = true,
		noNamespace: noPrefix,
	}: {
		type: PropertyType;
		fallback?: string | number;
		inherits?: boolean;
		noNamespace?: boolean;
	},
) {
	const escapedName = name.replace('$', '');
	const resolvedName =
		noPrefix ? `--${escapedName}` : `${TOKEN_PREFIX}-${escapedName}`;
	return {
		[TOKEN_BRAND]: true,
		name: resolvedName,
		type: type,
		fallback: fallback,
		var: `var(${resolvedName}${fallback ? `, ${fallback}` : ''})`,
		varFallback: (fallbackOverride?: string | number) =>
			`var(${resolvedName}, ${fallbackOverride ?? fallback ?? 'initial'})`,
		assign: (value?: string | number) =>
			`${resolvedName}: ${value ?? fallback};`,
		definition: `@property ${resolvedName} {
	syntax: '${type === '*' ? '*' : `<${type}>`}';
	inherits: ${inherits};
	initial-value: ${fallback ?? 'initial'};
}`,
		suffixed: (suffix: string) =>
			createToken(`${name}-${suffix}`, {
				type,
				fallback,
				inherits,
				noNamespace: noPrefix,
			}),
		prefixed: (prefix: string) =>
			createToken(`${prefix}-${name}`, {
				type,
				fallback,
				inherits,
				noNamespace: noPrefix,
			}),
	};
}

export type Token = ReturnType<typeof createToken>;
export type TokenSchema = {
	[Key: string]:
		| Token
		| TokenSchema
		| ((...args: any[]) => Record<string, Token>);
};

export function isToken(value: any): value is ReturnType<typeof createToken> {
	return typeof value === 'object' && value !== null && TOKEN_BRAND in value;
}

/**
 * Maps all token values to themselves - i.e.
 * {
 * '--🌗-black': 'var(--🌗-black)',
 * ...
 * }
 */
export function selfReferencedProps(
	schema: TokenSchema,
	{
		valuePrefix: prefix,
	}: {
		/** Apply a prefix to the referenced value, i.e. 'Ⓜ️' = '--🌗-black': '--🌗-Ⓜ️-black' */
		valuePrefix?: string;
	} = {},
): Record<string, string> {
	const result: Record<string, string> = {};
	function walk(node: Record<string, any>) {
		for (const key in node) {
			const value = node[key];
			if (isToken(value)) {
				if (prefix) {
					result[value.name] = value.prefixed(prefix).var;
				} else {
					result[value.name] = value.var;
				}
			} else if (typeof value === 'object') {
				walk(value);
			}
		}
	}
	walk(schema);
	return result;
}

export function tokenSchemaToList(schema: TokenSchema): Token[] {
	const result: Token[] = [];
	function walk(node: Record<string, any>) {
		for (const key in node) {
			const value = node[key];
			if (isToken(value)) {
				result.push(value);
			} else if (typeof value === 'object') {
				walk(value);
			}
		}
	}
	walk(schema);
	return result;
}
