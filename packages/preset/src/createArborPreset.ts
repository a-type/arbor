import {
	ColorRangeConfig,
	compileColors,
	CompiledColors,
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from '@arbor-css/colors';
import { PresetFunctions } from '@arbor-css/functions';
import { createGlobals, GlobalConfig } from '@arbor-css/globals';
import { ModeValues, PartialModeInstance } from '@arbor-css/modes';
import { createPrimitives } from '@arbor-css/primitives';
import {
	CompiledShadows,
	compileShadows,
	ShadowConfig,
} from '@arbor-css/shadows';
import {
	CompiledSpacing,
	compileSpacing,
	SpacingConfig,
} from '@arbor-css/spacing';
import {
	CompiledTypography,
	compileTypography,
	TypographyConfig,
} from '@arbor-css/typography';
import { deepMerge, DeepPartial } from '@arbor-css/util';
import {
	arborModeSchema,
	ArborModeSchemaDefinition,
	ArborModeValues,
	createArborModeValues,
	ModesOfArborModeSchema,
} from './arborPreset.js';
import { ArborPreset, definePreset } from './config.js';
import { BuiltinFunctions, presetFunctions } from './functions.js';

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
	functions?: PresetFunctions;
}

export type ArborPresetInstance<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
	TModes extends ModesOfArborModeSchema = ModesOfArborModeSchema,
	TFunctions extends PresetFunctions = PresetFunctions,
> = ArborPreset<
	ArborModeSchemaDefinition,
	TModes,
	CompiledColors<TRanges, TSchemes>,
	CompiledTypography,
	CompiledSpacing,
	CompiledShadows,
	BuiltinFunctions & TFunctions
> & {
	withMode: <TName extends string>(
		name: TName,
		mode: (
			preset: ArborPreset<
				ArborModeSchemaDefinition,
				TModes,
				CompiledColors<TRanges, TSchemes>
			>,
		) => DeepPartial<ModeValues<ArborModeSchemaDefinition>>,
	) => ArborPresetInstance<
		TRanges,
		TSchemes,
		TModes & {
			[K in TName]: PartialModeInstance<ArborModeSchemaDefinition>;
		}
	>;
	meta: {
		config: CreateArborPresetConfig<TRanges, TSchemes>;
	};
};

export function createArborPreset<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition> = Record<string, never>,
	TFunctions extends PresetFunctions = PresetFunctions,
>(
	inputConfig: CreateArborPresetConfig<TRanges, TSchemes>,
): ArborPresetInstance<TRanges, TSchemes, ModesOfArborModeSchema, TFunctions> {
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

	const baseModeValues: ArborModeValues = deepMerge(
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

	const functions = { ...presetFunctions, ...config.functions };

	const preset = definePreset({
		primitives,
		modes,
		functions,
	});

	(preset as any).withMode = (name: string, mode: any) => {
		modes[name] = arborModeSchema.createPartial(name, mode(preset));
		return preset as any;
	};
	(preset as any).meta = {
		config,
	};

	return preset as any;
}
