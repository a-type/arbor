import { PropertySchema, PROPS } from './core/properties';
import { DeepPartial, ModeOf, ModeSchemaLevel } from './modes/modeSchema';
import { SchemeDefinition } from './schemes/schemes';

export interface ArborBaseConfig<ModeShape extends ModeSchemaLevel> {
	namedHues: Record<string, number>;
	defaultScheme?: 'light' | 'dark' | (string & {});
	saturation: number;

	customSchemes: Record<string, SchemeDefinition>;

	modes: {
		base: ModeOf<ModeShape>;
		[key: string]: DeepPartial<ModeOf<ModeShape>>;
	};

	props: PropertySchema;
}

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ArborConfig<ModeShape extends ModeSchemaLevel> = MakeOptional<
	ArborBaseConfig<ModeShape>,
	'defaultScheme' | 'saturation' | 'customSchemes' | 'props'
>;

export function createConfig<ModeShape extends ModeSchemaLevel>(
	config: ArborConfig<ModeShape>,
): ArborBaseConfig<ModeShape> {
	return {
		saturation: 0.5,
		defaultScheme: 'light',
		customSchemes: {},
		props: PROPS,
		...config,
	};
}
