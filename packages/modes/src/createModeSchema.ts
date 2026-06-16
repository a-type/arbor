import { CssInterpolation, isCssInterpolation } from '@arbor-css/css-eval';
import { SimpleTokenDefinition, SimpleTokenSchema } from '@arbor-css/tokens';
import { deepMerge, DeepPartial } from '@arbor-css/util';

export type ModeSchemaProperty = SimpleTokenDefinition;

export type ModeValue = CssInterpolation;
export function isModeValue(value: any): value is ModeValue {
	return isCssInterpolation(value);
}
export type ModeValues<T extends SimpleTokenSchema> = {
	[P in keyof T]: NonNullable<T[P]> extends ModeSchemaProperty ? ModeValue
	: NonNullable<T[P]> extends SimpleTokenSchema ? ModeValues<NonNullable<T[P]>>
	: never;
};

export function createModeSchema<T extends SimpleTokenSchema>(input: T): T {
	return input;
}

const INTERNALS = '$$ARBOR_MODE_INTERNALS';

export type ModeInternals = {
	name: string;
	extraSelectors?: string[];
	extraCss?: string;
};

export type ModeInstance<T extends SimpleTokenSchema> = DeepPartial<
	ModeValues<T>
>;

export type ModeInstanceOptions = Omit<Partial<ModeInternals>, 'name'>;

export function createModeInstance<T extends SimpleTokenSchema>(
	name: string,
	values: DeepPartial<ModeValues<T>>,
	options?: ModeInstanceOptions,
): ModeInstance<T> {
	const internals = {
		...options,
		name,
	};
	const modeInstance = {
		...values,
	};
	Object.defineProperty(modeInstance, INTERNALS, {
		enumerable: false,
		value: internals,
	});
	return modeInstance;
}

export function getModeInternals(mode: ModeInstance<any>): ModeInternals {
	return (mode as any)[INTERNALS];
}

export function mergeModes(
	modeA: ModeInstance<any>,
	modeB: ModeInstance<any>,
): ModeInstance<any> {
	const values = deepMerge({}, modeA, modeB);
	const internalsA = getModeInternals(modeA);
	const internalsB = getModeInternals(modeB);
	const internals: ModeInternals = {
		extraSelectors: [
			...(internalsA.extraSelectors || []),
			...(internalsB.extraSelectors || []),
		],
		extraCss: [internalsA.extraCss, internalsB.extraCss]
			.filter(Boolean)
			.join('\n'),
		name: internalsB.name || internalsA.name, // prefer B's name if it exists
	};
	const instance = {
		...values,
	};
	Object.defineProperty(instance, INTERNALS, {
		enumerable: false,
		value: internals,
	});
	return instance;
}
