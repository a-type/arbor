import { CompiledColors } from '@arbor-css/colors';
import {
	ModeInstance,
	ModeSchemaLevel,
	PartialModeInstance,
} from '@arbor-css/modes';
import { Primitives } from '@arbor-css/primitives';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { TokenSchema } from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';

export interface ArborPreset<
	TModeShape extends ModeSchemaLevel,
	TModes extends Record<string, PartialModeInstance<TModeShape>>,
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
	} & TModes;
}

export function definePreset<
	TModeShape extends ModeSchemaLevel,
	TModes extends Record<string, PartialModeInstance<TModeShape>>,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TOtherTokens extends TokenSchema = TokenSchema,
>(
	config: ArborPreset<
		TModeShape,
		TModes,
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TOtherTokens
	>,
): ArborPreset<
	TModeShape,
	TModes,
	TCompiledColors,
	TTypography,
	TSpacing,
	TShadows,
	TOtherTokens
> {
	return config;
}
