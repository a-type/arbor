export const PROP_PREFIX = '--🎨';

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

const PROP_BRAND = '@@PROP@@';

export function createProp(
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
	const resolvedName = noPrefix ? `--${name}` : `${PROP_PREFIX}-${name}`;
	return {
		[PROP_BRAND]: true,
		name: resolvedName,
		type: type,
		fallback: fallback,
		var: `var(${resolvedName}${fallback ? `, ${fallback}` : ''})`,
		assign: (value?: string | number) =>
			`${resolvedName}: ${value ?? fallback};`,
		definition: `@property ${resolvedName} {
	syntax: '${type === '*' ? '*' : `<${type}>`}';
	inherits: ${inherits};
	initial-value: ${fallback ?? 'initial'};
}`,
		suffixed: (suffix: string) =>
			createProp(`${name}-${suffix}`, {
				type,
				fallback,
				inherits,
				noNamespace: noPrefix,
			}),
		prefixed: (prefix: string) =>
			createProp(`${prefix}-${name}`, {
				type,
				fallback,
				inherits,
				noNamespace: noPrefix,
			}),
	};
}

export type PropertyDefinition = ReturnType<typeof createProp>;
export type PropertySchema = {
	[Key: string]:
		| PropertyDefinition
		| PropertySchema
		| ((...args: any[]) => Record<string, PropertyDefinition>);
};

export function isProp(value: any): value is ReturnType<typeof createProp> {
	return typeof value === 'object' && value !== null && PROP_BRAND in value;
}

export function prefixProp(name: string, prefix: string) {
	const cleanName =
		name.startsWith(PROP_PREFIX) ? name.slice(PROP_PREFIX.length) : name;
	return `${PROP_PREFIX}-${prefix}${cleanName}`;
}

/**
 * Maps all PROP values to themselves - i.e.
 * {
 * '--🌗-black': 'var(--🌗-black)',
 * ...
 * }
 */
export function selfReferencedProps(
	schema: PropertySchema,
): Record<string, string> {
	const result: Record<string, string> = {};
	function walk(node: Record<string, any>) {
		for (const key in node) {
			const value = node[key];
			if (isProp(value)) {
				result[value.name] = value.var;
			} else if (typeof value === 'object') {
				walk(value);
			}
		}
	}
	walk(schema);
	return result;
}
