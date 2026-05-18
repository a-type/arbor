import {
	ColorRangeConfig,
	compileColors,
	CompiledColors,
	defaultDarkScheme,
	defaultLightScheme,
	SchemeDefinition,
} from '@arbor-css/colors';
import { createFunctionFactory, PresetFunctions } from '@arbor-css/functions';
import {
	createGlobalContext,
	createGlobals,
	GlobalConfig,
	GlobalContext,
	GlobalContextConfig,
} from '@arbor-css/globals';
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
	ArborModeSchemaDefinition,
	ArborModeValues,
	createArborModeSchema,
	createArborModeValues,
	ModesOfArborModeSchema,
} from './arborPreset.js';
import { ArborPreset, definePreset } from './config.js';
import { BuiltinFunctions, createPresetFunctions } from './functions.js';

export interface CreateArborConfig extends GlobalContextConfig {}

export interface CreateArborPresetConfig<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition>,
> {
	tokenPrefix?: string;
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
	baseMode?: DeepPartial<ModeValues<ArborModeSchemaDefinition>>;
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
		tokenPrefix: string;
		config: CreateArborPresetConfig<TRanges, TSchemes>;
	};
};

export interface ArborBuilder {
	context: GlobalContext;
	preset: <
		TRanges extends Record<string, ColorRangeConfig<any>>,
		TSchemes extends Record<string, SchemeDefinition> = Record<string, never>,
		TFunctions extends PresetFunctions = PresetFunctions,
	>(
		config: CreateArborPresetConfig<TRanges, TSchemes>,
	) => ArborPresetInstance<
		TRanges,
		TSchemes,
		ModesOfArborModeSchema,
		TFunctions
	>;
}

export function createArbor(config: CreateArborConfig = {}): ArborBuilder {
	const context = createGlobalContext(config);
	const modeSchema = createArborModeSchema({
		createToken: context.createToken,
	});
	const builtinFunctions = createPresetFunctions(
		context.$systemTokens,
		createFunctionFactory({
			tokenPrefix: context.tokenPrefix,
		}),
	);

	return {
		context,
		preset: (inputConfig) => {
			const normalizedConfig: CreateArborPresetConfig<any, any> = {
				...inputConfig,
				tokenPrefix: context.tokenPrefix,
				colors: {
					...inputConfig.colors,
					schemes: {
						light: defaultLightScheme,
						dark: defaultDarkScheme,
						...inputConfig.colors.schemes,
					},
				},
			};

			const globals = createGlobals(normalizedConfig.globals ?? {});

			const colors = compileColors({
				ranges: normalizedConfig.colors.ranges,
				schemes: normalizedConfig.colors.schemes,
				context,
			});

			const typography = compileTypography({
				...normalizedConfig.typography,
				context,
			});

			const spacing = compileSpacing({
				...normalizedConfig.spacing,
				context,
			});

			const shadows = compileShadows({
				...normalizedConfig.shadows,
				context,
			});

			const primitives = createPrimitives({
				colors,
				typography,
				spacing,
				shadows,
				globals,
				defaultScheme: normalizedConfig.colors.defaultScheme,
				schemeTags: normalizedConfig.colors.schemeTags,
				createToken: context.createToken,
			});

			const baseModeValues: ArborModeValues = deepMerge(
				createArborModeValues({
					mainColor: normalizedConfig.colors.mainColor as any,
					primitives,
					modeSchema,
					globalProps: context.$systemTokens.globals,
				}),
				normalizedConfig.baseMode ?? {},
			);

			const baseMode = modeSchema.createBase(baseModeValues);
			const modes: any = {
				base: baseMode,
			};
			const functions = {
				...builtinFunctions,
				...normalizedConfig.functions,
			};

			const preset = definePreset({
				primitives,
				modes,
				functions,
				systemProps: context.$systemTokens,
				meta: {
					config: normalizedConfig,
				},
				context,
			});

			(preset as any).withMode = (name: string, mode: any) => {
				modes[name] = modeSchema.createPartial(name, mode(preset));
				return preset as any;
			};
			(preset as any).meta = {
				tokenPrefix: context.tokenPrefix,
				config: normalizedConfig,
			};

			return preset as any;
		},
	};
}

export function createArborPreset<
	TRanges extends Record<string, ColorRangeConfig<any>>,
	TSchemes extends Record<string, SchemeDefinition> = Record<string, never>,
	TFunctions extends PresetFunctions = PresetFunctions,
>(
	inputConfig: CreateArborPresetConfig<TRanges, TSchemes>,
): ArborPresetInstance<TRanges, TSchemes, ModesOfArborModeSchema, TFunctions> {
	return createArbor({
		tokenPrefix: inputConfig.tokenPrefix,
	}).preset(inputConfig);
}
