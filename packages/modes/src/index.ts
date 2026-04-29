import { createToken, isToken, PropertyType, Token } from '@arbor-css/tokens';

export type ModePropertyType = PropertyType;
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
	$props: AsPropertyDefinitions<TSchema>;
	createBase: (
		def: ModeValues<TSchema>,
		config?: Partial<ModeConfig>,
	) => ModeInstance<TSchema>;
	createPartial: (
		def: DeepPartial<ModeValues<TSchema>>,
		config?: Partial<ModeConfig>,
	) => PartialModeInstance<TSchema>;
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
): Token {
	if (typeof prop === 'string') {
		return createToken(name, { type: prop });
	} else {
		return createToken(name, { type: prop.type, fallback: prop.fallback });
	}
}

export function createModeSchema<T extends ModeSchemaLevel>(
	input: T,
	{ tag = 'Ⓜ️' }: { tag?: string; maxDepthTracked?: number } = {},
): ModeSchema<T> {
	const PROPS = generateModeProperties(input, tag);
	const schema = {
		definition: input,
		tag,
		$props: PROPS,
		createBase: (def: ModeValues<T>, config?: Partial<ModeConfig>) => {
			return {
				values: def,
				schema,
				config: {
					maxDepthTracked: 10,
					...config,
				},
			};
		},
		createPartial: (
			def: DeepPartial<ModeValues<T>>,
			config?: Partial<ModeConfig>,
		) => {
			return {
				values: def,
				schema,
				config: {
					maxDepthTracked: 10,
					...config,
				},
			};
		},
	};
	return schema;
}

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> | undefined };

export type ModeValues<T extends ModeSchemaLevel> = {
	[P in keyof T]: T[P] extends ModeSchemaProperty ? string | number | Token
	: T[P] extends ModeSchemaLevel ? ModeValues<T[P]>
	: never;
};

export interface ModeConfig {
	maxDepthTracked: number;
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

function generateModeProperties<T extends ModeSchemaLevel>(
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

export function modeToCss(
	values: DeepPartial<ModeValues<any>>,
	propShape: AsPropertyDefinitions<any>,
	info: { modeName: string },
): Record<string, string> {
	return modeToCssDeep(values, propShape, info);
}

function modeToCssDeep(
	mode: any,
	propStructure: AsPropertyDefinitions<object>,
	info: { modeName: string },
	cssVars: Record<string, string> = {},
): Record<string, string> {
	for (const [key, value] of Object.entries(mode)) {
		const currentProp = (propStructure as any)[key as any] as any;
		if (typeof currentProp !== 'object') {
			continue;
		}
		if (!isToken(currentProp)) {
			modeToCssDeep(value, currentProp, info, cssVars);
		} else if (isToken(currentProp)) {
			if (isToken(value)) {
				cssVars[currentProp.name] = value.var;
			} else if (typeof value === 'string' || typeof value === 'number') {
				cssVars[currentProp.name] = value.toString();
			} else {
				throw new Error(
					`Invalid value for token ${currentProp.name}: ${value}. Must be a string, number, or $token (in mode ${info.modeName})`,
				);
			}
		} else {
			throw new Error(
				`Invalid mode schema structure at key: ${key} with value ${value} in mode ${info.modeName}`,
			);
		}
	}
	return cssVars;
}
