import { CompiledColors } from '@arbor-css/colors';
import { PresetFunctions } from '@arbor-css/functions';
import { GlobalContext, SystemTokens } from '@arbor-css/globals';
import { PresetMixins } from '@arbor-css/mixins';
import {
	ModeInstance,
	ModeSchema,
	ModeSchemaLevel,
	ModeTokens,
	PartialModeInstance,
} from '@arbor-css/modes';
import { Primitives, PrimitiveTokens } from '@arbor-css/primitives';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { CompiledTypography } from '@arbor-css/typography';

/**
 * Collected tokens of the entire preset.
 */
export type PresetTokens<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
> = {
	mode: ModeTokens<TModeShape>;
	primitives: PrimitiveTokens<TCompiledColors, TTypography, TSpacing, TShadows>;
	system: SystemTokens;
};

export interface ArborPreset<
	TModeShape extends ModeSchemaLevel = ModeSchemaLevel,
	TModes extends Record<string, PartialModeInstance<TModeShape>> = Record<
		string,
		PartialModeInstance<TModeShape>
	>,
	TCompiledColors extends CompiledColors = CompiledColors,
	TTypography extends CompiledTypography = CompiledTypography,
	TSpacing extends CompiledSpacing = CompiledSpacing,
	TShadows extends CompiledShadows = CompiledShadows,
	TFunctions extends PresetFunctions = PresetFunctions,
	TMixins extends PresetMixins = PresetMixins,
> {
	primitives: Primitives<TCompiledColors, TTypography, TSpacing, TShadows>;
	modes: {
		base: ModeInstance<TModeShape>;
	} & TModes;
	functions: TFunctions;
	mixins: TMixins;
	/** Easy access to your mode schema */
	mode: ModeSchema<TModeShape>;
	/** All tokens in this preset. */
	$: PresetTokens<TModeShape, TCompiledColors, TTypography, TSpacing, TShadows>;
	meta?: {
		config?: unknown;
	};
	context: GlobalContext;
}

export function definePreset<
	TModeShape extends ModeSchemaLevel,
	TModes extends Record<string, PartialModeInstance<TModeShape>>,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TFunctions extends PresetFunctions,
	TMixins extends PresetMixins,
>(
	config: Omit<
		ArborPreset<
			TModeShape,
			TModes,
			TCompiledColors,
			TTypography,
			TSpacing,
			TShadows,
			TFunctions,
			TMixins
		>,
		'$' | 'mode' | 'functions' | 'mixins'
	> & {
		functions?: TFunctions;
		mixins?: TMixins;
	} & {
		systemProps: SystemTokens;
		meta?: ArborPreset['meta'];
	},
): ArborPreset<
	TModeShape,
	TModes,
	TCompiledColors,
	TTypography,
	TSpacing,
	TShadows,
	TFunctions,
	TMixins
> {
	const tokens = {
		mode: config.modes.base.schema.$tokens,
		primitives: config.primitives.$tokens,
		system: config.systemProps,
	};
	return {
		functions: {} as TFunctions,
		mixins: {} as TMixins,
		...config,
		mode: config.modes.base.schema,
		$: tokens,
		meta: config.meta,
	};
}

export type AnyArborPreset = ArborPreset<
	any,
	Record<string, PartialModeInstance<any>>,
	any,
	any,
	any,
	any,
	PresetFunctions,
	PresetMixins
>;
