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
	[Key: string]: ModeSchemaProperty | ModeSchemaLevel;
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
	{ tag = 'Ⓜ️' }: { tag?: string } = {},
): ModeSchema<T> {
	const PROPS = createModeTokens(input, tag);
	const schema = {
		definition: input,
		tag,
		$tokens: PROPS,
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
	[P in keyof T]: T[P] extends ModeSchemaProperty ? ModeValue
	: T[P] extends ModeSchemaLevel ? ModeValues<T[P]>
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
			[P in keyof T]: T[P] extends string ? Token
			: T[P] extends object ? AsPropertyDefinitions<T[P]>
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
