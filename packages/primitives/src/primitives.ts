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
	color: TCompiledColors;
	typography: TCompiledTypography;
	spacing: TCompiledSpacing;
	shadow: TCompiledShadows;
	easing: TCompiledEasingFunctions;
	duration: TDurations;
	defaultScheme?: keyof TCompiledColors;
	schemeTags?: Record<string, string>;
	global?: Partial<GlobalConfig>;
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
	color: LiteralsToTokens<TCompiledColors[keyof TCompiledColors]['colors']>;
	typography: LiteralsToTokens<TTypography['levels']>;
	spacing: LiteralsToTokens<TSpacing['levels']>;
	shadow: LiteralsToTokens<TShadows['levels']>;
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
	color: TCompiledColors;
	typography: TCompiledTypography;
	spacing: TCompiledSpacing;
	shadow: TCompiledShadows;
	easing: TCompiledEasingFunctions;
	duration: TDurations;
	defaultScheme: keyof TCompiledColors;
	schemeTags: Record<string, string>;
	global: GlobalConfig;
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
		color: colors,
		defaultScheme,
		global: userGlobals,
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
			}),
			weight: createPrimitiveToken(`typography-${path.join('-')}-weight`, {
				type: '*',
				purpose: 'font-weight',
				group: path.join('-'),
			}),
			lineHeight: createPrimitiveToken(
				`typography-${path.join('-')}-line-height`,
				{
					type: '*',
					purpose: 'line-height',
					group: path.join('-'),
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
			}),
	);

	const $shadowProps = convertStructure(
		config.shadow.levels,
		isCompiledShadowLevel,
		(_, path) => ({
			x: createPrimitiveToken(`shadow-${path.join('-')}-x`, {
				type: 'length',
				purpose: 'shadow-x',
				group: path.join('-'),
			}),
			y: createPrimitiveToken(`shadow-${path.join('-')}-y`, {
				type: 'length',
				purpose: 'shadow-y',
				group: path.join('-'),
			}),
			blur: createPrimitiveToken(`shadow-${path.join('-')}-blur`, {
				type: 'length',
				purpose: 'shadow-blur',
				group: path.join('-'),
			}),
			spread: createPrimitiveToken(`shadow-${path.join('-')}-spread`, {
				type: 'length',
				purpose: 'shadow-spread',
				group: path.join('-'),
			}),
			color: createPrimitiveToken(`shadow-${path.join('-')}-color`, {
				type: 'color',
				purpose: 'shadow-color',
				group: path.join('-'),
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
			}),
	);

	const $durationProps = convertStructure(
		config.duration,
		(value): value is string => typeof value === 'string',
		(_, path) =>
			createPrimitiveToken(`duration-${path.join('-')}`, {
				type: 'string',
				purpose: 'duration',
				group: path.join('-'),
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

	console.log(config.easing, $easingProps);
	return {
		defaultScheme: defaultScheme ?? defaultDefaultScheme,
		schemeTags,
		global: globals,
		color: colors,
		typography: config.typography,
		spacing: config.spacing,
		shadow: config.shadow,
		easing: config.easing,
		duration: config.duration,
		$tokens: {
			color: $colorProps,
			typography: $typographyProps,
			spacing: $spacingProps,
			shadow: $shadowProps,
			easing: $easingProps,
			duration: $durationProps,
		},
	};
}
