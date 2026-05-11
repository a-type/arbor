import { createToken, isToken, Token, TokenPurpose } from '@arbor-css/tokens';
import { isTrackedValue, TrackedValue } from './tracking.js';

export type ModePropertyType = TokenPurpose;
export type ModeSchemaProperty =
	| ModePropertyType
	| {
			type: ModePropertyType;
			fallback: string;
	  };

export type ModeSchemaLevel = {
	/**
	 * Special key: creates a token at the current group path without appending
	 * a `-$root` segment. For example, `{ colors: { main: { $root: 'color', mid: 'color' } } }`
	 * generates `--Ⓜ️-colors-main` (for `$root`) and `--Ⓜ️-colors-main-mid` (for `mid`).
	 * Optional at any level.
	 */
	$root?: ModeSchemaProperty;
	[Key: string]: ModeSchemaProperty | ModeSchemaLevel | undefined;
};
export type ModeSchema<TSchema extends ModeSchemaLevel = ModeSchemaLevel> = {
	definition: TSchema;
	tag: string;
	$tokens: AsPropertyDefinitions<TSchema>;
	createBase: (def: ModeValues<TSchema>) => ModeInstance<TSchema>;
	createPartial: (
		name: string,
		def: DeepPartial<ModeValues<TSchema>>,
	) => PartialModeInstance<TSchema>;
	extend: <TExtensionSchema extends ModeSchemaLevel>(
		extension: TExtensionSchema,
	) => ModeSchema<TSchema & TExtensionSchema>;
	extraCss?: string;
};

function isModeSchemaProperty(value: any): value is ModeSchemaProperty {
	return (
		typeof value === 'string' ||
		(typeof value === 'object' &&
			value !== null &&
			'type' in value &&
			value.type !== undefined)
	);
}
function getModeSchemaPropertyAsPropertyDefinition(
	name: string,
	prop: ModeSchemaProperty,
	group?: string,
): Token {
	if (typeof prop === 'string') {
		return createToken(name, { purpose: prop, group });
	} else {
		return createToken(name, {
			purpose: prop.type,
			fallback: prop.fallback,
			group,
		});
	}
}

export function createModeSchema<T extends ModeSchemaLevel>(
	input: T,
	{ tag = 'Ⓜ️', extraCss }: { tag?: string; extraCss?: string } = {},
): ModeSchema<T> {
	const PROPS = createModeTokens(input, tag);
	const schema = {
		definition: input,
		tag,
		$tokens: PROPS,
		extraCss,
		createBase: (def: ModeValues<T>) => {
			return {
				values: def,
				schema,
				config: {
					name: 'base',
				},
			};
		},
		createPartial: (name: string, def: DeepPartial<ModeValues<T>>) => {
			return {
				values: def,
				schema,
				config: {
					name,
				},
			};
		},
		extend: <TExtensionSchema extends ModeSchemaLevel>(
			extension: TExtensionSchema,
		) => {
			const extendedDefinition = {
				...schema.definition,
				...extension,
			} as T & TExtensionSchema;
			return createModeSchema(extendedDefinition, {
				tag: schema.tag,
			});
		},
	};
	return schema;
}

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> | undefined };

export type ModeValue = string | number | Token | TrackedValue;
export function isModeValue(value: any): value is ModeValue {
	return (
		isTrackedValue(value) ||
		isToken(value) ||
		typeof value === 'string' ||
		typeof value === 'number'
	);
}
export type ModeValues<T extends ModeSchemaLevel> = {
	[P in keyof T]: NonNullable<T[P]> extends ModeSchemaProperty ? ModeValue
	: NonNullable<T[P]> extends ModeSchemaLevel ? ModeValues<NonNullable<T[P]>>
	: never;
};

export interface ModeConfig {
	name: string;
}

export type ModeInstance<T extends ModeSchemaLevel> = {
	values: ModeValues<T>;
	schema: ModeSchema<T>;
	config: ModeConfig;
};
export type PartialModeInstance<T extends ModeSchemaLevel> = Omit<
	ModeInstance<T>,
	'values'
> & {
	values: DeepPartial<ModeValues<T>>;
};

type AsPropertyDefinitions<T> =
	T extends object ?
		{
			[P in keyof T]: NonNullable<T[P]> extends string ? Token
			: NonNullable<T[P]> extends object ? AsPropertyDefinitions<NonNullable<T[P]>>
			: never;
		}
	:	never;

function createModeTokens<T extends ModeSchemaLevel>(
	root: T,
	tag: string,
): AsPropertyDefinitions<T> {
	function generatePropsForSchemaLevel(
		schemaLevel: any,
		propPrefix: string,
	): any {
		const propsLevel: any = {};
		for (const key in schemaLevel) {
			const value = schemaLevel[key];
			if (key === '$root') {
				// $root generates a token at the current group path (no segment appended)
				if (isModeSchemaProperty(value)) {
					propsLevel.$root = getModeSchemaPropertyAsPropertyDefinition(
						propPrefix,
						value,
						propPrefix,
					);
				}
				continue;
			}
			const currentPrefix = `${propPrefix}-${key.toLowerCase()}`;
			if (isModeSchemaProperty(value)) {
				const propertyDefinition = getModeSchemaPropertyAsPropertyDefinition(
					currentPrefix,
					value,
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

export function flattenToPropsList(obj: any): Token[] {
	const propsList: Token[] = [];
	for (const key in obj) {
		if (isToken(obj[key])) {
			propsList.push(obj[key]);
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			propsList.push(...flattenToPropsList(obj[key]));
		}
	}
	return propsList;
}
