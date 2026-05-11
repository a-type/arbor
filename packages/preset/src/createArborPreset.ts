import {
	ColorRangeConfig,
	compileColors,
	CompiledColors,
	SchemeDefinition,
} from '@arbor-css/colors';
import { createGlobals, GlobalConfig } from '@arbor-css/globals';
import { DeepPartial, ModeValues, PartialModeInstance } from '@arbor-css/modes';
import { createPrimitives } from '@arbor-css/primitives';
import { compileShadows, ShadowConfig } from '@arbor-css/shadows';
import { compileSpacing, SpacingConfig } from '@arbor-css/spacing';
import { compileTypography, TypographyConfig } from '@arbor-css/typography';
import {
	ArborModeSchema,
	arborModeSchema,
	createArborModeValues,
} from './arborPreset.js';
import { ArborPreset } from './config.js';

export interface CreateArborPresetConfig<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
> {
	globals?: Partial<GlobalConfig>;
	colors: {
		ranges: TRanges;
		schemes?: TSchemes;
		mainColor: keyof TRanges;
		defaultScheme?: keyof CompiledColors<TRanges, TSchemes>;
		schemeTags?: Record<string, string>;
	};
	typography?: Omit<TypographyConfig, 'globals'>;
	spacing?: Omit<SpacingConfig, 'globals'>;
	shadows?: Omit<ShadowConfig, 'globals'>;
	baseMode?: Partial<ModeValues<(typeof arborModeSchema)['definition']>>;
}

export type ArborPresetInstance<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
	TModes extends Record<
		string,
		PartialModeInstance<ArborModeSchema['definition']>
	> = Record<string, PartialModeInstance<ArborModeSchema['definition']>>,
> = ArborPreset<
	ArborModeSchema['definition'],
	TModes,
	CompiledColors<TRanges, TSchemes>
> & {
	withMode: <TName extends string>(
		name: TName,
		mode: () => DeepPartial<ModeValues<ArborModeSchema['definition']>>,
	) => ArborPresetInstance<
		TRanges,
		TSchemes,
		TModes & {
			[K in TName]: PartialModeInstance<ArborModeSchema['definition']>;
		}
	>;
};

export function createArborPreset<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition> = Record<string, never>,
>(
	config: CreateArborPresetConfig<TRanges, TSchemes>,
): ArborPresetInstance<TRanges, TSchemes> {
	const globals = createGlobals(config.globals ?? {});

	const colors = compileColors({
		ranges: config.colors.ranges,
		schemes: config.colors.schemes,
		globals,
	});

	const typography = compileTypography({
		...config.typography,
		globals,
	});

	const spacing = compileSpacing({
		...config.spacing,
		globals,
	});

	const shadows = compileShadows({
		...config.shadows,
		globals,
	});

	const primitives = createPrimitives({
		colors,
		typography,
		spacing,
		shadows,
		globals,
		defaultScheme: config.colors.defaultScheme,
		schemeTags: config.colors.schemeTags,
	});

	const baseModeValues = {
		...createArborModeValues({
			mainColor: config.colors.mainColor as any,
			primitives,
		}),
		...config.baseMode,
	};

	const baseMode = arborModeSchema.createBase(baseModeValues);

	const modes: any = {
		base: baseMode,
	};

	return {
		modes,
		primitives,
		withMode(name, mode) {
			modes[name] = arborModeSchema.createPartial(name, mode());
			return this as any;
		},
	};
}
