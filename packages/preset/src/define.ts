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
	mergeModes,
	ModeInstance,
	ModeInstanceOptions,
	ModeValues,
} from '@arbor-css/modes';
import {
	convertSimpleTokenSchema,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
} from '@arbor-css/tokens';
import { deepMerge, DeepPartial } from '@arbor-css/util';

// if no extends exist, this is an implicit base type
type EmptyPreset = ArborPreset<
	// empty object
	// TODO: use some kind of sentinel type which can avoid allowing
	// arbitrary keys but doesn't leak dummy keys into tokens.
	{},
	{},
	{}
>;

export type ExtendedConfigModeSchema<TExtends extends AnyArborPreset[]> =
	TExtends[number] extends ArborPreset<infer TModeSchema, any, any> ?
		TModeSchema
	:	{};

export type ExtendedConfigFunctions<TExtends extends AnyArborPreset[]> =
	TExtends[number] extends ArborPreset<any, infer TFunctions, any> ? TFunctions
	:	PresetFunctions;

export type ExtendedConfigMixins<TExtends extends AnyArborPreset[]> =
	TExtends[number] extends ArborPreset<any, any, infer TMixins> ? TMixins
	:	PresetMixins;

/**
 * Collected tokens of the entire preset.
 */
export type PresetTokens<
	TModeSchema extends SimpleTokenSchema,
	TMixins extends PresetMixins,
> = {
	mode: SimpleTokensAsTokenDefinitions<TModeSchema>;
	system: SystemTokens;
	mixins: MixinTokens<TMixins>;
};

export const INTERNALS = Symbol('ARBOR_INTERNALS');

export interface ArborPreset<
	TModeSchema extends SimpleTokenSchema = SimpleTokenSchema,
	TFunctions extends PresetFunctions = PresetFunctions,
	TMixins extends PresetMixins = PresetMixins,
> {
	functions: TFunctions;
	mixins: TMixins;
	/** Easy access to your mode schema */
	modeSchema: TModeSchema;
	/** Values you applied for your base mode */
	baseMode: ModeInstance<TModeSchema>;
	/** All tokens in this preset. */
	$: PresetTokens<TModeSchema, TMixins>;
	context: GlobalContext;
	extends: AnyArborPreset[];
	/**
	 * Produces a copy of this preset with different global configuration
	 * values.
	 */
	withConfig(
		options: GlobalContextConfig,
	): ArborPreset<TModeSchema, TFunctions, TMixins>;

	/**
	 * Add a 'bundled' mode to this preset. Bundled modes are included in the
	 * generated CSS stylesheet when this preset is passed to generateStylesheet.
	 */
	bundleMode<TMode extends ModeInstance<TModeSchema>>(
		name: string,
		mode: DeepPartial<ModeValues<TModeSchema>>,
		options?: ModeInstanceOptions & { overwrite?: boolean },
	): TMode;
	/**
	 * Create a free-standing mode from your mode schema with full typing
	 * support. A mode created with this method isn't bundled into the
	 * generated CSS stylesheet when this preset is passed to generateStylesheet.
	 * You can use this to create a mode with CSS that's loaded lazily.
	 */
	createMode<TMode extends ModeInstance<TModeSchema>>(
		name: string,
		mode: DeepPartial<ModeValues<TModeSchema>>,
		options?: ModeInstanceOptions,
	): TMode;

	meta: {
		name: string;
	};
}

export type BaseModeValues<
	TModeSchema extends SimpleTokenSchema,
	TExtends extends AnyArborPreset[],
> =
	Record<never, never> extends ExtendedConfigModeSchema<TExtends> ?
		ModeValues<TModeSchema>
	:	DeepPartial<ModeValues<ExtendedConfigModeSchema<TExtends>>> &
			ModeValues<TModeSchema>;

type NoInferT<T> = [T][T extends any ? 0 : never];

export interface DefinePresetConfig<
	TModeSchema extends SimpleTokenSchema,
	TFunctions extends PresetFunctions,
	TMixins extends PresetMixins,
	TExtends extends AnyArborPreset[],
> {
	name: string;
	modeSchema: TModeSchema;
	// base mode typings don't have access to mixins tokens defined
	// in this preset - otherwise, type inference breaks in weird ways.
	// This is ok since the local base mode shouldn't really use mixin tokens
	// from the same preset - it's "below" mixins in the overall order of things
	baseMode: (
		$tokens: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			ExtendedConfigMixins<NoInferT<TExtends>>
		>,
		context: GlobalContext,
	) => BaseModeValues<TModeSchema, TExtends>;
	baseModeOptions?: (
		$tokens: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			ExtendedConfigMixins<NoInferT<TExtends>>
		>,
		context: GlobalContext,
	) => ModeInstanceOptions;
	defaultScheme?: 'light' | 'dark';
	mixins?: (
		create: CreateMixin,
		$: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			// Do not include mixin tokens when defining mixins -
			// this would be circular logic
			ExtendedConfigMixins<NoInferT<TExtends>>
		>,
	) => TMixins;
	functions?: (
		create: CreateFunction,
		$: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			ExtendedConfigMixins<NoInferT<TExtends>> & NoInferT<TMixins>
		>,
	) => TFunctions;
	extends?: TExtends;
	config?: GlobalContextConfig;
}

export type DefinePresetConfigWithMixins<
	TModeSchema extends SimpleTokenSchema,
	TFunctions extends PresetFunctions,
	TCreateMixins extends (
		create: CreateMixin,
		$: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			ExtendedConfigMixins<NoInferT<TExtends>>
		>,
	) => PresetMixins,
	TExtends extends AnyArborPreset[],
> = Omit<
	DefinePresetConfig<
		TModeSchema,
		TFunctions,
		ReturnType<TCreateMixins>,
		TExtends
	>,
	'mixins'
> & {
	mixins: TCreateMixins;
};

function emptyPreset(): ArborPreset {
	return {
		functions: {} as any,
		mixins: {} as any,
		modeSchema: {} as any,
		baseMode: {} as any,
		$: {
			mode: {},
			mixins: {},
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
		},
		bundleMode() {
			return {} as any;
		},
		createMode() {
			return {} as any;
		},
	};
}

export function definePreset<
	TModeSchema extends SimpleTokenSchema,
	TFunctions extends PresetFunctions,
	TCreateMixins extends (
		create: CreateMixin,
		$: PresetTokens<
			ExtendedConfigModeSchema<NoInferT<TExtends>> & TModeSchema,
			ExtendedConfigMixins<NoInferT<TExtends>>
		>,
	) => PresetMixins,
	TExtends extends AnyArborPreset[] = [EmptyPreset],
>(
	config: DefinePresetConfigWithMixins<
		TModeSchema,
		TFunctions,
		TCreateMixins,
		TExtends
	>,
): ArborPreset<
	ExtendedConfigModeSchema<TExtends> & TModeSchema,
	ExtendedConfigFunctions<TExtends> & TFunctions,
	ExtendedConfigMixins<TExtends> & ReturnType<TCreateMixins>
>;

export function definePreset<
	TModeSchema extends SimpleTokenSchema,
	TFunctions extends PresetFunctions,
	TExtends extends AnyArborPreset[] = [EmptyPreset],
>(
	config: Omit<
		DefinePresetConfig<TModeSchema, TFunctions, {}, TExtends>,
		'mixins'
	> & {
		mixins?: undefined;
	},
): ArborPreset<
	ExtendedConfigModeSchema<TExtends> & TModeSchema,
	ExtendedConfigFunctions<TExtends> & TFunctions,
	ExtendedConfigMixins<TExtends>
>;

export function definePreset<
	TModeSchema extends SimpleTokenSchema,
	TFunctions extends PresetFunctions,
	TMixins extends PresetMixins,
	TExtends extends AnyArborPreset[] = [EmptyPreset],
>({
	functions: createFunctions,
	mixins: createMixins,
	config,
	...presetOptions
}: DefinePresetConfig<TModeSchema, TFunctions, TMixins, TExtends>): ArborPreset<
	ExtendedConfigModeSchema<TExtends> & TModeSchema,
	ExtendedConfigFunctions<TExtends> & TFunctions,
	ExtendedConfigMixins<TExtends> & TMixins
> {
	function withConfig(
		options: GlobalContextConfig,
	): ArborPreset<TModeSchema, TFunctions, TMixins> {
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
				$: deepMerge({}, acc.$ || {}, presetWithConfig.$),
				modeSchema: deepMerge(
					{},
					acc.modeSchema || {},
					presetWithConfig.modeSchema,
				),
				baseMode: deepMerge(
					{},
					acc.baseMode || {},
					presetWithConfig.baseMode || {},
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
			} as any;
		}, emptyPreset());

		const $tokensWithoutMixins = {
			...composedPresets.$,
			system: context.$systemTokens,
			mode: deepMerge(
				{},
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

		const $tokens: PresetTokens<any, any> = {
			...$tokensWithoutMixins,
			mixins: {
				...$tokensWithoutMixins.mixins,
				...extractMixinTokens(mixins),
			},
		} as any;

		const functions =
			createFunctions ?
				createFunctions(context.createFunction, $tokens as any)
			:	({} as TFunctions);

		const internals = {
			modes: {},
			defaultScheme: presetOptions.defaultScheme ?? 'light',
		} as PresetInternals;

		const modeSchema = deepMerge(
			{},
			composedPresets.modeSchema,
			presetOptions.modeSchema,
		);

		const baseMode = createModeInstance(
			'base',
			deepMerge(
				{},
				composedPresets.baseMode as any,
				presetOptions.baseMode($tokens as any, context) as any,
			) as any,
			{
				extraSelectors: [':root'],
				...presetOptions.baseModeOptions?.($tokens as any, context),
			},
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

			baseMode,

			bundleMode(
				name: string,
				mode: DeepPartial<ModeValues<TModeSchema>>,
				options?: ModeInstanceOptions & { overwrite?: boolean },
			) {
				const instance = createModeInstance(name, mode, options);
				if (options?.overwrite) {
					internals.modes[name] = instance;
					return instance;
				}
				const existing = internals.modes[name];
				if (existing) {
					internals.modes[name] = mergeModes(existing || {}, instance);
				} else {
					internals.modes[name] = instance;
				}
				return internals.modes[name];
			},

			createMode(
				name: string,
				mode: DeepPartial<ModeValues<TModeSchema>>,
				options?: ModeInstanceOptions,
			) {
				return createModeInstance(name, mode, options);
			},
		} as any;
	}

	return withConfig(config ?? {}) as any;
}

export interface PresetInternals {
	modes: Record<string, ModeInstance<any>>;
	defaultScheme: string;
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

export type AnyArborPreset = ArborPreset<any, PresetFunctions, PresetMixins>;
