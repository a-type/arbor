import { DeepPartial, ModeOf, ModeSchemaLevel } from '@arbor-css/modes';
import { CompiledColors } from '@arbor-css/schemes';
import { Primitives } from './primitives/primitives';

export interface ArborConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
> {
	primitives: Primitives<TCompiledColors>;
	modes: {
		base: ModeOf<TModeShape>;
		[key: string]: DeepPartial<ModeOf<TModeShape>>;
	};
}

export function createConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
>(
	config: ArborConfig<TModeShape, TCompiledColors>,
): ArborConfig<TModeShape, TCompiledColors> {
	return config;
}
