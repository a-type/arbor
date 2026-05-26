import { ColorRangeItem, CompiledColors } from '@arbor-css/colors';
import { defaultGlobals, GlobalConfig } from '@arbor-css/globals';
import { CompiledShadows, isCompiledShadowLevel } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { CreateToken, Token } from '@arbor-css/tokens';
import { CompiledTypography, isTypographyLevel } from '@arbor-css/typography';
import { convertStructure } from '@arbor-css/util';

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography<any>,
	TCompiledSpacing extends CompiledSpacing<any>,
	TCompiledShadows extends CompiledShadows<any>,
	TCompiledEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
> {
	colors: TCompiledColors;
	typography: TCompiledTypography;
	spacing: TCompiledSpacing;
	shadows: TCompiledShadows;
	easing: TCompiledEasingFunctions;
	durations: TDurations;
	defaultScheme?: keyof TCompiledColors;
	schemeTags?: Record<string, string>;
	globals?: Partial<GlobalConfig>;
	createToken: CreateToken;
}

type LiteralsToTokens<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends string | number ? Token
	: T[K] extends Record<string, any> ? LiteralsToTokens<T[K]>
	: never;
};

export interface PrimitivesColorScheme {
	[Color: string]: ColorRangeItem[];
}

export type PrimitiveTokens<
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography,
	TSpacing extends CompiledSpacing,
	TShadows extends CompiledShadows,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
> = {
	colors: LiteralsToTokens<TCompiledColors[keyof TCompiledColors]['colors']>;
	typography: LiteralsToTokens<TTypography['levels']>;
	spacing: LiteralsToTokens<TSpacing['levels']>;
	shadows: LiteralsToTokens<TShadows['levels']>;
	easing: LiteralsToTokens<TEasingFunctions>;
	duration: LiteralsToTokens<TDurations>;
};

export type Primitives<
	TCompiledColors extends CompiledColors = CompiledColors,
	TCompiledTypography extends CompiledTypography = CompiledTypography,
	TCompiledSpacing extends CompiledSpacing = CompiledSpacing,
	TCompiledShadows extends CompiledShadows = CompiledShadows,
	TCompiledEasingFunctions extends Record<string, string> = Record<
		string,
		string
	>,
	TDurations extends Record<string, string> = Record<string, string>,
> = {
	/**
	 * A map of color values, keyed by scheme name.
	 * Each entry is the same structure: a record of color name keys
	 * and string values which represent CSS colors.
	 */
	colors: TCompiledColors;
	typography: TCompiledTypography;
	spacing: TCompiledSpacing;
	shadows: TCompiledShadows;
	easing: TCompiledEasingFunctions;
	defaultScheme: keyof TCompiledColors;
	schemeTags: Record<string, string>;
	globals: GlobalConfig;
	$tokens: PrimitiveTokens<
		TCompiledColors,
		TCompiledTypography,
		TCompiledSpacing,
		TCompiledShadows,
		TCompiledEasingFunctions,
		TDurations
	>;
};

export function createPrimitives<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography,
	TCompiledSpacing extends CompiledSpacing,
	TCompiledShadows extends CompiledShadows,
	TCompiledEasingFunctions extends Record<string, string>,
	TCompiledDurations extends Record<string, string>,
>(
	config: PrimitivesConfig<
		TCompiledColors,
		TCompiledTypography,
		TCompiledSpacing,
		TCompiledShadows,
		TCompiledEasingFunctions,
		TCompiledDurations
	>,
): Primitives<
	TCompiledColors,
	TCompiledTypography,
	TCompiledSpacing,
	TCompiledShadows,
	TCompiledEasingFunctions
> {
	const {
		colors,
		defaultScheme,
		globals: userGlobals,
		createToken: createPrimitiveToken,
	} = config;
	const arbitraryScheme = Object.values(colors)[0];
	if (!arbitraryScheme) {
		throw new Error('At least one color scheme must be defined in primitives');
	}

	// TODO: validate all scheme shapes are the same...
	const $colorProps = convertStructure(
		arbitraryScheme.colors,
		(item) => typeof item === 'string',
		(_, path) =>
			createPrimitiveToken(path.join('-'), {
				type: 'color',
				purpose: 'color',
				group: path.slice(0, -1).join('-'),
				tag: 'primitive',
			}),
	);

	const $typographyProps = convertStructure(
		config.typography.levels,
		isTypographyLevel,
		(_, path) => ({
			size: createPrimitiveToken(`typography-${path.join('-')}-size`, {
				type: 'length',
				purpose: 'font-size',
				group: path.join('-'),
				tag: 'primitive',
			}),
			weight: createPrimitiveToken(`typography-${path.join('-')}-weight`, {
				type: '*',
				purpose: 'font-weight',
				group: path.join('-'),
				tag: 'primitive',
			}),
			lineHeight: createPrimitiveToken(
				`typography-${path.join('-')}-line-height`,
				{
					type: '*',
					purpose: 'line-height',
					group: path.join('-'),
					tag: 'primitive',
				},
			),
		}),
	);

	const $spacingProps = convertStructure(
		config.spacing.levels,
		(value): value is string | number =>
			typeof value === 'string' || typeof value === 'number',
		(_, path) =>
			createPrimitiveToken(`spacing-${path.join('-')}`, {
				type: 'length',
				purpose: 'spacing',
				tag: 'primitive',
			}),
	);

	const $shadowProps = convertStructure(
		config.shadows.levels,
		isCompiledShadowLevel,
		(_, path) => ({
			x: createPrimitiveToken(`shadow-${path.join('-')}-x`, {
				type: 'length',
				purpose: 'shadow-x',
				group: path.join('-'),
				tag: 'primitive',
			}),
			y: createPrimitiveToken(`shadow-${path.join('-')}-y`, {
				type: 'length',
				purpose: 'shadow-y',
				group: path.join('-'),
				tag: 'primitive',
			}),
			blur: createPrimitiveToken(`shadow-${path.join('-')}-blur`, {
				type: 'length',
				purpose: 'shadow-blur',
				group: path.join('-'),
				tag: 'primitive',
			}),
			spread: createPrimitiveToken(`shadow-${path.join('-')}-spread`, {
				type: 'length',
				purpose: 'shadow-spread',
				group: path.join('-'),
				tag: 'primitive',
			}),
			color: createPrimitiveToken(`shadow-${path.join('-')}-color`, {
				type: 'color',
				purpose: 'shadow-color',
				group: path.join('-'),
				tag: 'primitive',
			}),
		}),
	);

	const $easingProps = convertStructure(
		config.easing,
		(value): value is string => typeof value === 'string',
		(_, path) =>
			createPrimitiveToken(`easing-${path.join('-')}`, {
				type: 'string',
				purpose: 'easing-function',
				group: path.join('-'),
				tag: 'primitive',
			}),
	);

	const $durationProps = convertStructure(
		config.durations,
		(value): value is string => typeof value === 'string',
		(_, path) =>
			createPrimitiveToken(`duration-${path.join('-')}`, {
				type: 'string',
				purpose: 'duration',
				group: path.join('-'),
				tag: 'primitive',
			}),
	);

	const globals: GlobalConfig = {
		...defaultGlobals,
		...userGlobals,
	};

	const schemeTags = {
		light: 'light',
		dark: 'dark',
		...config.schemeTags,
	};

	return {
		defaultScheme: defaultScheme ?? defaultDefaultScheme,
		schemeTags,
		globals,
		colors,
		typography: config.typography,
		spacing: config.spacing,
		shadows: config.shadows,
		easing: config.easing,
		$tokens: {
			colors: $colorProps,
			typography: $typographyProps,
			spacing: $spacingProps,
			shadows: $shadowProps,
			easing: $easingProps,
			duration: $durationProps,
		},
	};
}
