import {
	ModeInstance,
	ModeSchemaLevel,
	PartialModeInstance,
} from '@arbor-css/modes';
import { CompiledColors } from '@arbor-css/schemes';
import { Primitives } from './primitives/primitives';

export interface ArborConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
> {
	primitives: Primitives<TCompiledColors>;
	modes: {
		base: ModeInstance<TModeShape>;
		[key: string]: PartialModeInstance<TModeShape>;
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
