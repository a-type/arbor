export const TOKEN_PREFIX = '--';

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

/**
 * Roughly mapped / inspired by designtokens.org.
 * Not currently used... but I wrote them down, so...
 */
export type TokenType =
	| 'color'
	| 'dimension'
	| 'font-family'
	| 'font-weight'
	| 'duration'
	| 'cubic-bezier'
	| 'number'
	| 'font-style'
	| 'ratio'
	| 'url'
	| TokenCompositeType;

export type TokenCompositeTypeShapes = {
	strokeStyle:
		| {
				dashArray: { value: string; unit: string }[];
				lineCap: string;
		  }
		| string;
	border: {
		color: string;
		width: string;
		style: string;
	};
	transition: {
		duration: string;
		delay: string;
		timingFunction: string;
	};
	shadow:
		| {
				offsetX: string;
				offsetY: string;
				blur: string;
				spread: string;
				color: string;
		  }
		| {
				offsetX: string;
				offsetY: string;
				blur: string;
				spread: string;
				color: string;
		  }[];
	gradient: {
		color: string;
		position: string;
	}[];
	typography: {
		fontFamily: string;
		fontSize: string;
		fontWeight: string;
		letterSpacing: string;
		lineHeight: string;
	};
};
export type TokenCompositeType = keyof TokenCompositeTypeShapes;

export type TokenPurpose =
	| 'color'
	| 'font-size'
	| 'font-weight'
	| 'font-family'
	| 'line-height'
	| 'spacing'
	| 'shadow'
	| 'border-radius'
	| 'border-width'
	| 'shadow-x'
	| 'shadow-y'
	| 'shadow-blur'
	| 'shadow-spread'
	| 'shadow-color'
	| 'size'
	| 'other';

export function getTypeFromPurpose(purpose: TokenPurpose): PropertyType {
	switch (purpose) {
		case 'color':
			return 'color';
		case 'font-size':
			return 'length';
		case 'font-weight':
			return 'number';
		case 'line-height':
			return 'length-percentage';
		case 'font-family':
			return 'string';
		case 'spacing':
			return 'length';
		case 'shadow':
			return 'string';
		default:
			return '*';
	}
}

const TOKEN_BRAND = '@@TOKEN@@';

export function createToken(
	name: string,
	{
		fallback,
		inherits = true,
		forceDefinition,
		purpose = 'other',
		type = getTypeFromPurpose(purpose),
		group,
		tag,
	}: {
		/** Inferred from purpose if not provided, defaults to "*" */
		type?: PropertyType;
		purpose?: TokenPurpose;
		group?: string;
		fallback?: string | number;
		tag?: string;
		inherits?: boolean;
		/**
		 * Force the generation of a @property rule definition, even if it's not meaningful.
		 * Otherwise tokens whose properties have no special concerns like inherit:false will
		 * skip generating an @property
		 */
		forceDefinition?: boolean;
	},
) {
	const escapedName = name.replaceAll('$', '');
	const taggedName = tag ? `${tag}-${escapedName}` : escapedName;
	const resolvedName = `${TOKEN_PREFIX}${taggedName}`;
	return {
		[TOKEN_BRAND]: true as const,
		name: resolvedName,
		type,
		tag,
		purpose,
		group,
		fallback,
		var: `var(${resolvedName}${fallback ? `, ${fallback}` : ''})`,
		varFallback: (fallbackOverride?: string | number) =>
			`var(${resolvedName}, ${fallbackOverride ?? fallback ?? 'initial'})`,
		assign: (value?: string | number) =>
			`${resolvedName}: ${value ?? fallback};`,
		get definition() {
			if (inherits === false || forceDefinition) {
				return `@property ${resolvedName} { syntax: '${type === '*' ? '*' : `<${type}>`}'; inherits: ${inherits}; initial-value: ${fallback ?? 'initial'}; }`;
			}
			return '';
		},
		suffixed: (suffix: string) =>
			createToken(`${name}-${suffix}`, {
				type,
				fallback,
				inherits,
				tag,
			}),
		prefixed: (prefix: string) =>
			createToken(`${prefix}-${name}`, {
				type,
				fallback,
				inherits,
				tag,
			}),
	};
}

export type Token = ReturnType<typeof createToken>;
export type TokenSchema = {
	[Key: string]: Token | TokenSchema;
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
