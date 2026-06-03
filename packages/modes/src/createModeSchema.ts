import { Equation, isCalcEquation } from '@arbor-css/calc';
import {
	isToken,
	SimpleTokenDefinition,
	SimpleTokenSchema,
	Token,
} from '@arbor-css/tokens';
import { DeepPartial } from '@arbor-css/util';

export type ModeSchemaProperty = SimpleTokenDefinition;

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

const INTERNALS = Symbol('ARBOR_MODE_INTERNALS');

export type ModeInternals = {
	name: string;
	extraSelectors?: string[];
	extraCss?: string;
};

export type ModeInstance<T extends SimpleTokenSchema> = DeepPartial<
	ModeValues<T>
>;

export function createModeInstance<T extends SimpleTokenSchema>(
	name: string,
	values: DeepPartial<ModeValues<T>>,
	options?: Omit<Partial<ModeInternals>, 'name'>,
): ModeInstance<T> {
	const internals = {
		...options,
		name,
	};
	const modeInstance = {
		...values,
		[INTERNALS]: internals,
	};
	return modeInstance;
}

export function getModeInternals(mode: ModeInstance<any>): ModeInternals {
	return (mode as any)[INTERNALS];
}
