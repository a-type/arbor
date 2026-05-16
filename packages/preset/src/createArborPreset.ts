import {
	ColorRangeConfig,
	compileColors,
	CompiledColors,
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from '@arbor-css/colors';
import { ArborFunction } from '@arbor-css/functions';
import { createGlobals, GlobalConfig } from '@arbor-css/globals';
import { ModeValues, PartialModeInstance } from '@arbor-css/modes';
import { createPrimitives } from '@arbor-css/primitives';
import { compileShadows, ShadowConfig } from '@arbor-css/shadows';
import { compileSpacing, SpacingConfig } from '@arbor-css/spacing';
import { compileTypography, TypographyConfig } from '@arbor-css/typography';
import { deepMerge, DeepPartial } from '@arbor-css/util';
import {
	ArborModeSchema,
	arborModeSchema,
	createArborModeValues,
} from './arborPreset.js';
import { ArborPreset } from './config.js';
import { presetFunctions } from './functions.js';

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
	baseMode?: DeepPartial<ModeValues<(typeof arborModeSchema)['definition']>>;
	functions?: ArborFunction[];
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
		mode: (
			preset: ArborPreset<
				ArborModeSchema['definition'],
				TModes,
				CompiledColors<TRanges, TSchemes>
			>,
		) => DeepPartial<ModeValues<ArborModeSchema['definition']>>,
	) => ArborPresetInstance<
		TRanges,
		TSchemes,
		TModes & {
			[K in TName]: PartialModeInstance<ArborModeSchema['definition']>;
		}
	>;
	meta: {
		config: CreateArborPresetConfig<TRanges, TSchemes>;
	};
};

export function createArborPreset<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition> = Record<string, never>,
>(
	inputConfig: CreateArborPresetConfig<TRanges, TSchemes>,
): ArborPresetInstance<TRanges, TSchemes> {
	const config: CreateArborPresetConfig<TRanges, TSchemes> = {
		...inputConfig,
		colors: {
			...inputConfig.colors,
			schemes: {
				light: defaultLightScheme,
				dark: defaultDarkScheme,
				...inputConfig.colors.schemes,
			} as any,
		},
	};

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

	const baseModeValues: ModeValues<ArborModeSchema['definition']> = deepMerge(
		createArborModeValues({
			mainColor: config.colors.mainColor as any,
			primitives,
		}),
		config.baseMode ?? {},
	);

	const baseMode = arborModeSchema.createBase(baseModeValues);

	const modes: any = {
		base: baseMode,
	};

	const functions = [...presetFunctions, ...(config.functions ?? [])];

	const preset: ArborPreset<any, any> = {
		modes,
		primitives,
		functions,
	};

	(preset as any).withMode = (name: string, mode: any) => {
		modes[name] = arborModeSchema.createPartial(name, mode(preset));
		return preset as any;
	};
	(preset as any).meta = {
		config,
	};

	return preset as ArborPresetInstance<TRanges, TSchemes>;
}
