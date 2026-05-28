import { Equation, isCalcEquation } from '@arbor-css/calc';
import {
	isToken,
	SimpleTokenDefinition,
	SimpleTokenSchema,
	Token,
} from '@arbor-css/tokens';

export type ModeSchemaProperty = SimpleTokenDefinition;

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
	schema: T;
	config: ModeConfig;
};
export type PartialModeInstance<T extends SimpleTokenSchema> = Omit<
	ModeInstance<T>,
	'values'
> & {
	values: DeepPartial<ModeValues<T>>;
};

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

export function createModeSchema<T extends SimpleTokenSchema>(input: T): T {
	return input;
}

export function createModeInstance<T extends SimpleTokenSchema>(
	schema: T,
	values: ModeValues<T>,
	config: ModeConfig,
): ModeInstance<T> {
	return {
		schema,
		values,
		config,
	};
}

export function createPartialModeInstance<T extends SimpleTokenSchema>(
	schema: T,
	values: DeepPartial<ModeValues<T>>,
	config: ModeConfig,
): PartialModeInstance<T> {
	return {
		schema,
		values,
		config,
	};
}
