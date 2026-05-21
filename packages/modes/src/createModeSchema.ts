import { Equation, isCalcEquation } from '@arbor-css/calc';
import {
	convertSimpleTokenSchema,
	CreateToken,
	isToken,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
	Token,
	TokenPurpose,
} from '@arbor-css/tokens';

export type ModePropertyType = TokenPurpose;
export type ModeSchemaProperty =
	| ModePropertyType
	| {
			type: ModePropertyType;
			fallback: string;
	  };

export type ModeSchema<TSchema extends SimpleTokenSchema = SimpleTokenSchema> =
	{
		definition: TSchema;
		tag: string;
		$tokens: SimpleTokensAsTokenDefinitions<TSchema>;
		createBase: (def: ModeValues<TSchema>) => ModeInstance<TSchema>;
		createPartial: (
			name: string,
			def: DeepPartial<ModeValues<TSchema>>,
		) => PartialModeInstance<TSchema>;
		extend: <TExtensionSchema extends SimpleTokenSchema>(
			extension: TExtensionSchema,
		) => ModeSchema<TSchema & TExtensionSchema>;
		extraCss?: string;
	};

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> | undefined };

export type ModeValue = string | number | Token | Equation;
export function isModeValue(value: any): value is ModeValue {
	return (
		isCalcEquation(value) ||
		isToken(value) ||
		typeof value === 'string' ||
		typeof value === 'number'
	);
}
export type ModeValues<T extends SimpleTokenSchema> = {
	[P in keyof T]: NonNullable<T[P]> extends ModeSchemaProperty ? ModeValue
	: NonNullable<T[P]> extends SimpleTokenSchema ? ModeValues<NonNullable<T[P]>>
	: never;
};

export interface ModeConfig {
	name: string;
}

export type ModeInstance<T extends SimpleTokenSchema> = {
	values: ModeValues<T>;
	schema: ModeSchema<T>;
	config: ModeConfig;
};
export type PartialModeInstance<T extends SimpleTokenSchema> = Omit<
	ModeInstance<T>,
	'values'
> & {
	values: DeepPartial<ModeValues<T>>;
};

export type ModeTokens<T> =
	T extends object ?
		{
			[P in keyof T]: NonNullable<T[P]> extends string ? Token
			: NonNullable<T[P]> extends object ? ModeTokens<NonNullable<T[P]>>
			: never;
		}
	:	never;

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

export function createModeSchema<T extends SimpleTokenSchema>(
	input: T,
	{
		tag = '',
		extraCss,
		createToken: createTokenValue,
	}: {
		tag?: string;
		extraCss?: string;
		createToken: CreateToken;
	},
): ModeSchema<T> {
	const PROPS = convertSimpleTokenSchema(input, tag, createTokenValue);
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
		extend: <TExtensionSchema extends SimpleTokenSchema>(
			extension: TExtensionSchema,
		) => {
			const extendedDefinition = {
				...schema.definition,
				...extension,
			} as T & TExtensionSchema;
			return createModeSchema(extendedDefinition, {
				tag: schema.tag,
				createToken: createTokenValue,
			});
		},
	};
	return schema;
}
