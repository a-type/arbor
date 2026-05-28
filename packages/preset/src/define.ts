import { CompiledColors } from '@arbor-css/colors';
import {
	CreateFunction,
	CreateMixin,
	extractMixinTokens,
	MixinTokens,
	PresetFunctions,
	PresetMixins,
} from '@arbor-css/functions';
import {
	createGlobalContext,
	GlobalContext,
	GlobalContextConfig,
	SystemTokens,
} from '@arbor-css/globals';
import {
	createModeInstance,
	ModeInstance,
	ModeValues,
	PartialModeInstance,
} from '@arbor-css/modes';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import {
	convertSimpleTokenSchema,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
} from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';
import { deepMerge, DeepPartial } from '@arbor-css/util';
import {
	createPrimitiveTokens,
	PrimitiveTokens,
} from './createPrimitiveTokens.js';

/**
 * Taking an input array of presets, reduces to the combined
 * token set by merging their token types together
 */
export type ExtendedConfigPrimitiveTokens<TExtends extends AnyArborPreset[]> =
	TExtends[number] extends (
		ArborPreset<
			any,
			infer TColors,
			infer TTypography,
			infer TSpacing,
			infer TShadows,
			infer TEasingFunctions,
			infer TDurations,
			any,
			any
		>
	) ?
		PrimitiveTokens<
			TColors,
			TTypography,
			TSpacing,
			TShadows,
			TEasingFunctions,
			TDurations
		>
	:	{};

// if no extends exist, this is an implicit base type
type EmptyPreset = ArborPreset<
	{},
	CompiledColors<any, any>,
	CompiledTypography<any>,
	CompiledSpacing<any>,
	CompiledShadows<any>,
	{},
	{},
	{},
	{}
>;

export type ExtendedConfigModeSchema<TExtends extends AnyArborPreset[]> =
	TExtends[number] extends (
		ArborPreset<infer TModeSchema, any, any, any, any, any, any, any, any>
	) ?
		TModeSchema
	:	{};

/**
 * Collected tokens of the entire preset.
 */
export type PresetTokens<
	TModeSchema extends SimpleTokenSchema,
	TColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
	TShadows extends CompiledShadows<any>,
	TMixins extends PresetMixins,
	TExtends extends AnyArborPreset[] = [],
> = {
	mode: SimpleTokensAsTokenDefinitions<TModeSchema>;
	primitives: ExtendedConfigPrimitiveTokens<TExtends> &
		PrimitiveTokens<
			TColors,
			TTypography,
			TSpacing,
			TShadows,
			TEasingFunctions,
			TDurations
		>;
	system: SystemTokens;
	mixins: MixinTokens<TMixins>;
};

export const INTERNALS = Symbol('ARBOR_INTERNALS');

export interface ArborPreset<
	TModeSchema extends SimpleTokenSchema = SimpleTokenSchema,
	TCompiledColors extends CompiledColors = CompiledColors,
	TTypography extends CompiledTypography = CompiledTypography,
	TSpacing extends CompiledSpacing = CompiledSpacing,
	TShadows extends CompiledShadows = CompiledShadows,
	TEasingFunctions extends Record<string, string> = Record<string, string>,
	TDurations extends Record<string, string> = Record<string, string>,
	TFunctions extends PresetFunctions = PresetFunctions,
	TMixins extends PresetMixins = PresetMixins,
> {
	functions: TFunctions;
	mixins: TMixins;
	/** Easy access to your mode schema */
	modeSchema: TModeSchema;
	/** All tokens in this preset. */
	$: PresetTokens<
		TModeSchema,
		TCompiledColors,
		TTypography,
		TSpacing,
		TEasingFunctions,
		TDurations,
		TShadows,
		TMixins
	>;
	context: GlobalContext;
	extends: AnyArborPreset[];
	/**
	 * Produces a copy of this preset with different global configuration
	 * values.
	 */
	withConfig(
		options: GlobalContextConfig,
	): ArborPreset<
		TModeSchema,
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TEasingFunctions,
		TDurations,
		TFunctions,
		TMixins
	>;

	/**
	 * Define the base mode values for your preset. You must provide a
	 * base value for every token in the mode schema.
	 */
	baseMode(mode: ModeValues<TModeSchema>): ModeInstance<TModeSchema>;

	/**
	 * Add a 'bundled' mode to this preset. Bundled modes are included in the
	 * generated CSS stylesheet when this preset is passed to generateStylesheet.
	 */
	bundleMode(
		name: string,
		mode: DeepPartial<ModeValues<TModeSchema>>,
	): PartialModeInstance<TModeSchema>;
	/**
	 * Create a free-standing mode from your mode schema with full typing
	 * support. A mode created with this method isn't bundled into the
	 * generated CSS stylesheet when this preset is passed to generateStylesheet.
	 * You can use this to create a mode with CSS that's loaded lazily.
	 */
	createMode(
		name: string,
		mode: DeepPartial<ModeValues<TModeSchema>>,
	): PartialModeInstance<TModeSchema>; // TODO:

	meta: {
		name: string;
		/**
		 * The initial configuration for this preset.
		 */
		init: DefinePresetConfig<any, any, any, any, any, any, any, any, any, any>;
	};
}

export interface DefinePresetConfigPrimitives<
	TColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
> {
	color?: TColors;
	typography?: TTypography;
	spacing?: TSpacing;
	shadow?: TShadows;
	easing?: TEasingFunctions;
	duration?: TDurations;
}

export interface DefinePresetConfig<
	TModeSchema extends SimpleTokenSchema,
	TColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
	TFunctions extends PresetFunctions,
	TMixins extends PresetMixins,
	TExtends extends AnyArborPreset[],
> {
	name: string;
	modeSchema: TModeSchema;
	primitives?: (
		context: GlobalContext,
	) => DefinePresetConfigPrimitives<
		TColors,
		TTypography,
		TSpacing,
		TShadows,
		TEasingFunctions,
		TDurations
	>;
	defaultScheme?: keyof TColors;
	mixins?: (
		create: CreateMixin,
		$: PresetTokens<
			TModeSchema,
			TColors,
			TTypography,
			TSpacing,
			TEasingFunctions,
			TDurations,
			TShadows,
			// Do not include mixin tokens when defining mixins -
			// this would be circular logic
			{}
		>,
	) => TMixins;
	functions?: (
		create: CreateFunction,
		$: PresetTokens<
			TModeSchema,
			TColors,
			TTypography,
			TSpacing,
			TEasingFunctions,
			TDurations,
			TShadows,
			TMixins
		>,
	) => TFunctions;
	extends?: TExtends;
	config?: GlobalContextConfig;
}

const emptyPreset: ArborPreset = {
	functions: {} as any,
	mixins: {} as any,
	modeSchema: {} as any,
	$: {
		mode: {},
		mixins: {},
		primitives: {
			color: {},
			duration: {},
			easing: {},
			shadow: {},
			spacing: {},
			typography: {},
		} as any,
		system: {
			global: {},
			meta: {},
		} as any,
	},
	context: {} as any,
	extends: [],
	withConfig() {
		return this;
	},
	meta: {
		name: 'empty',
		init: {} as any,
	},
	baseMode() {
		return {} as any;
	},
	bundleMode() {
		return {} as any;
	},
	createMode() {
		return {} as any;
	},
};

export function definePreset<
	TModeSchema extends SimpleTokenSchema,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
	TFunctions extends PresetFunctions,
	TMixins extends PresetMixins,
	TExtends extends AnyArborPreset[] = [EmptyPreset],
>({
	functions: createFunctions,
	mixins: createMixins,
	config,
	...presetOptions
}: DefinePresetConfig<
	TModeSchema,
	TCompiledColors,
	TTypography,
	TSpacing,
	TShadows,
	TEasingFunctions,
	TDurations,
	TFunctions,
	TMixins,
	TExtends
>): ArborPreset<
	ExtendedConfigModeSchema<TExtends> & TModeSchema,
	TCompiledColors,
	TTypography,
	TSpacing,
	TShadows,
	TEasingFunctions,
	TDurations,
	TFunctions,
	TMixins
> {
	function withConfig(
		options: GlobalContextConfig,
	): ArborPreset<
		TModeSchema,
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TEasingFunctions,
		TDurations,
		TFunctions,
		TMixins
	> {
		const context = createGlobalContext(options);

		const extended = presetOptions.extends ?? [];
		const composedPresets = extended.reduce<AnyArborPreset>((acc, preset) => {
			// recursively apply config to lower presets in the extends chain
			const presetWithConfig = preset.withConfig(options);
			return {
				...acc,
				context,
				extends: [...acc.extends, presetWithConfig],
				// merge everything together. higher presets override duplicates.
				$: deepMerge(acc.$ || {}, presetWithConfig.$),
				modeSchema: deepMerge(
					acc.modeSchema || {},
					presetWithConfig.modeSchema,
				),
				functions: {
					...acc.functions,
					...presetWithConfig.functions,
				},
				mixins: {
					...acc.mixins,
					...presetWithConfig.mixins,
				},
				withConfig: () => {
					// no-op
					return acc as any;
				},
			};
		}, emptyPreset);

		const composedPrimitiveValues = extended.reduce((acc, preset) => {
			return deepMerge(acc || {}, preset.meta.init.primitives || {});
		}, {});

		const resolvedPrimitives =
			presetOptions.primitives ? presetOptions.primitives(context) : {};

		const $tokensWithoutMixins = {
			...composedPresets.$,
			system: context.$systemTokens,
			primitives:
				presetOptions.primitives ?
					deepMerge(
						composedPresets.$?.primitives || {},
						createPrimitiveTokens({
							createToken: context.createPrimitiveToken,
							...resolvedPrimitives,
						}) as any,
					)
				:	composedPresets.$?.primitives || {},
			mode: deepMerge(
				composedPresets.$.mode || {},
				convertSimpleTokenSchema(
					presetOptions.modeSchema,
					'',
					context.createModeToken,
				),
			),
		};

		const mixins =
			createMixins ?
				createMixins(context.createMixin, $tokensWithoutMixins as any)
			:	({} as TMixins);

		const $tokens: PresetTokens<any, any, any, any, any, any, any, any> = {
			...$tokensWithoutMixins,
			mixins: {
				...$tokensWithoutMixins.mixins,
				...extractMixinTokens(mixins),
			},
		};

		const functions =
			createFunctions ?
				createFunctions(context.createFunction, $tokens as any)
			:	({} as TFunctions);

		const internals = {
			modes: {
				base: {} as any,
			},
			defaultScheme: presetOptions.defaultScheme ?? 'light',
			primitiveValues: deepMerge(composedPrimitiveValues, resolvedPrimitives),
		} as PresetInternals;

		const modeSchema = deepMerge(
			composedPresets.modeSchema,
			presetOptions.modeSchema,
		);

		return {
			...composedPresets,

			context,
			// attach internals with private access via symbol
			[INTERNALS]: internals,

			meta: {
				name: presetOptions.name,
				init: presetOptions,
			},
			$: $tokens,
			// add mixins and functions to composed bases
			functions: {
				...composedPresets.functions,
				...functions,
			},
			mixins: {
				...composedPresets.mixins,
				...mixins,
			},
			modeSchema,

			withConfig,

			baseMode(mode: ModeValues<TModeSchema>) {
				return (internals.modes.base = createModeInstance(modeSchema, mode, {
					name: 'base',
				}));
			},

			bundleMode(name: string, mode: DeepPartial<ModeValues<TModeSchema>>) {
				return (internals.modes[name] = createModeInstance(
					modeSchema,
					mode as any,
					{
						name,
					},
				));
			},

			createMode(name: string, mode: DeepPartial<ModeValues<TModeSchema>>) {
				return createModeInstance(modeSchema, mode as any, {
					name,
				});
			},
		} as any;
	}

	return withConfig(config ?? {}) as any;
}

export interface PresetInternals {
	modes: {
		base: ModeInstance<any>;
		[name: string]: PartialModeInstance<any>;
	};
	defaultScheme: string;
	primitiveValues: {
		color: CompiledColors<any, any>;
		typography: CompiledTypography<any>;
		spacing: CompiledSpacing<any>;
		shadow: CompiledShadows<any>;
		easing: Record<string, string>;
		duration: Record<string, string>;
	};
}

export function getInternals(preset: AnyArborPreset): PresetInternals {
	const internals = (preset as any)[INTERNALS];
	if (!internals) {
		throw new Error(
			'Preset internals not found. Are you sure this is an Arbor preset?',
		);
	}
	return internals;
}

export type AnyArborPreset = ArborPreset<
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	PresetFunctions,
	PresetMixins
>;
