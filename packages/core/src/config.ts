import { CompiledColors } from '@arbor-css/colors';
import {
	ModeInstance,
	ModeSchemaLevel,
	PartialModeInstance,
} from '@arbor-css/modes';
import { TokenSchema } from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';
import { CompiledShadows, CompiledSpacing } from './index.js';
import { Primitives } from './primitives/primitives.js';

export interface ArborConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any> = CompiledColors<any, any>,
	TTypography extends CompiledTypography<any> = CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any> = CompiledSpacing<any>,
	TShadows extends CompiledShadows<any> = CompiledShadows<any>,
	TOtherTokens extends TokenSchema = TokenSchema,
> {
	primitives: Primitives<
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TOtherTokens
	>;
	modes: {
		base: ModeInstance<TModeShape>;
		[key: string]: PartialModeInstance<TModeShape>;
	};
}

export function createConfig<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TOtherTokens extends TokenSchema = TokenSchema,
>(
	config: ArborConfig<
		TModeShape,
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TOtherTokens
	>,
): ArborConfig<
	TModeShape,
	TCompiledColors,
	TTypography,
	TSpacing,
	TShadows,
	TOtherTokens
> {
	return config;
}
