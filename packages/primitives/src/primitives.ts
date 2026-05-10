import { ColorRangeItem, CompiledColors } from '@arbor-css/colors';
import { defaultGlobals, GlobalConfig } from '@arbor-css/globals';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { createToken, Token, TokenSchema } from '@arbor-css/tokens';
import { CompiledTypography, isTypographyLevel } from '@arbor-css/typography';
import { convertStructure } from '@arbor-css/util';

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography<any>,
	TCompiledSpacing extends CompiledSpacing<any>,
	TCompiledShadows extends CompiledShadows<any>,
	TOtherTokens extends TokenSchema = TokenSchema,
> {
	colors: TCompiledColors;
	typography: TCompiledTypography;
	spacing: TCompiledSpacing;
	shadows: TCompiledShadows;
	misc?: TOtherTokens;
	defaultScheme?: keyof TCompiledColors;
	schemeTags?: Record<string, string>;
	globals?: Partial<GlobalConfig>;
}

type LiteralsToTokens<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends string | number ? Token
	: T[K] extends Record<string, any> ? LiteralsToTokens<T[K]>
	: never;
};

export interface PrimitivesColorScheme {
	[Color: string]: ColorRangeItem[];
}

export type Primitives<
	TCompiledColors extends CompiledColors<any, any> = CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography = CompiledTypography,
	TCompiledSpacing extends CompiledSpacing = CompiledSpacing,
	TCompiledShadows extends CompiledShadows = CompiledShadows,
	TOtherTokens extends TokenSchema = TokenSchema,
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
	defaultScheme: keyof TCompiledColors;
	schemeTags: Record<string, string>;
	globals: GlobalConfig;
	$tokens: {
		colors: LiteralsToTokens<TCompiledColors[keyof TCompiledColors]['colors']>;
		typography: LiteralsToTokens<TCompiledTypography['levels']>;
		spacing: LiteralsToTokens<TCompiledSpacing['levels']>;
		shadows: LiteralsToTokens<TCompiledShadows['levels']>;
	} & TOtherTokens;
};

export function createPrimitives<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography,
	TCompiledSpacing extends CompiledSpacing,
	TCompiledShadows extends CompiledShadows,
	TOtherTokens extends TokenSchema,
>(
	config: PrimitivesConfig<
		TCompiledColors,
		TCompiledTypography,
		TCompiledSpacing,
		TCompiledShadows,
		TOtherTokens
	>,
): Primitives<
	TCompiledColors,
	TCompiledTypography,
	TCompiledSpacing,
	TCompiledShadows,
	TOtherTokens
> {
	const { colors, defaultScheme, globals: userGlobals } = config;
	const arbitraryScheme = Object.values(colors)[0];
	if (!arbitraryScheme) {
		throw new Error('At least one color scheme must be defined in primitives');
	}

	// TODO: validate all scheme shapes are the same...
	const $colorProps = convertStructure(
		arbitraryScheme.colors,
		(item) => typeof item === 'string',
		(_, path) =>
			createToken(path.join('-'), {
				type: 'color',
				purpose: 'color',
				group: path.slice(0, -1).join('-'),
				tag: '🎨',
			}),
	);

	const $typographyProps = convertStructure(
		config.typography.levels,
		isTypographyLevel,
		(_, path) => ({
			size: createToken(`typography-${path.join('-')}-size`, {
				type: 'length',
				purpose: 'font-size',
				group: path.join('-'),
				tag: '🅰️',
			}),
			weight: createToken(`typography-${path.join('-')}-weight`, {
				type: '*',
				purpose: 'font-weight',
				group: path.join('-'),
				tag: '🅰️',
			}),
			lineHeight: createToken(`typography-${path.join('-')}-line-height`, {
				type: '*',
				purpose: 'line-height',
				group: path.join('-'),
				tag: '🅰️',
			}),
		}),
	);

	const $spacingProps = convertStructure(
		config.spacing.levels,
		(value): value is string | number =>
			typeof value === 'string' || typeof value === 'number',
		(_, path) =>
			createToken(`spacing-${path.join('-')}`, {
				type: 'length',
				purpose: 'spacing',
				tag: 's',
			}),
	);

	const $shadowProps = convertStructure(
		config.shadows.levels,
		(value): value is string | number =>
			typeof value === 'string' || typeof value === 'number',
		(_, path) =>
			createToken(`shadow-${path.join('-')}`, {
				type: '*',
				purpose: 'shadow',
				tag: '🌫️',
			}),
	);

	const globals: GlobalConfig = {
		...defaultGlobals,
		...userGlobals,
	};

	const schemeTags = {
		light: '☀️',
		dark: '🌑',
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
		$tokens: {
			...(config.misc ?? ({} as TOtherTokens)),
			colors: $colorProps,
			typography: $typographyProps,
			spacing: $spacingProps,
			shadows: $shadowProps,
		},
	};
}
