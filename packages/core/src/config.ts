import { CompiledColors } from '@arbor-css/colors';
import {
	ModeInstance,
	ModeSchemaLevel,
	PartialModeInstance,
} from '@arbor-css/modes';
import { TokenSchema } from '@arbor-css/tokens';
import { Primitives } from './primitives/primitives.js';

export interface ArborConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
	TOtherTokens extends TokenSchema = TokenSchema,
> {
	primitives: Primitives<TCompiledColors, TOtherTokens>;
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
