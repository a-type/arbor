import { CompiledColors } from '@arbor-css/colors';
import {
	extractMixinTokens,
	MixinTokens,
	PresetFunctions,
	PresetMixins,
} from '@arbor-css/functions';
import { GlobalContext, SystemTokens } from '@arbor-css/globals';
import {
	ModeInstance,
	ModeSchema,
	ModeTokens,
	PartialModeInstance,
} from '@arbor-css/modes';
import { Primitives, PrimitiveTokens } from '@arbor-css/primitives';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { SimpleTokenSchema } from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';

/**
 * Collected tokens of the entire preset.
 */
export type PresetTokens<
	TModeShape extends SimpleTokenSchema,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
	TShadows extends CompiledShadows<any>,
	TMixins extends PresetMixins,
> = {
	mode: ModeTokens<TModeShape>;
	primitives: PrimitiveTokens<
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TEasingFunctions,
		TDurations
	>;
	system: SystemTokens;
	mixins: MixinTokens<TMixins>;
};

export interface ArborPreset<
	TModeShape extends SimpleTokenSchema = SimpleTokenSchema,
	TModes extends Record<string, PartialModeInstance<TModeShape>> = Record<
		string,
		PartialModeInstance<TModeShape>
	>,
	TCompiledColors extends CompiledColors = CompiledColors,
	TTypography extends CompiledTypography = CompiledTypography,
	TSpacing extends CompiledSpacing = CompiledSpacing,
	TShadows extends CompiledShadows = CompiledShadows,
	TEasingFunctions extends Record<string, string> = Record<string, string>,
	TDurations extends Record<string, string> = Record<string, string>,
	TFunctions extends PresetFunctions = PresetFunctions,
	TMixins extends PresetMixins = PresetMixins,
> {
	primitives: Primitives<
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TEasingFunctions,
		TDurations
	>;
	modes: {
		base: ModeInstance<TModeShape>;
	} & TModes;
	functions: TFunctions;
	mixins: TMixins;
	/** Easy access to your mode schema */
	mode: ModeSchema<TModeShape>;
	/** All tokens in this preset. */
	$: PresetTokens<
		TModeShape,
		TCompiledColors,
		TTypography,
		TSpacing,
		TEasingFunctions,
		TDurations,
		TShadows,
		TMixins
	>;
	meta?: {
		config?: unknown;
	};
	context: GlobalContext;
}

export function definePreset<
	TModeShape extends SimpleTokenSchema,
	TModes extends Record<string, PartialModeInstance<TModeShape>>,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
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
			TEasingFunctions,
			TDurations,
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
	TEasingFunctions,
	TDurations,
	TFunctions,
	TMixins
> {
	const tokens = {
		mode: config.modes.base.schema.$tokens,
		primitives: config.primitives.$tokens,
		system: config.systemProps,
		mixins: extractMixinTokens(config.mixins ?? ({} as TMixins)),
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
	any,
	any,
	PresetFunctions,
	PresetMixins
>;
