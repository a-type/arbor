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

export function createModeSchema<T extends SimpleTokenSchema>(input: T): T {
	return input;
}

export type ModeInstance<T extends SimpleTokenSchema> = DeepPartial<
	ModeValues<T>
> & {
	$name: string;
};

export function createModeInstance<T extends SimpleTokenSchema>(
	name: string,
	values: DeepPartial<ModeValues<T>>,
): ModeInstance<T> {
	return {
		...values,
		$name: name,
	};
}
