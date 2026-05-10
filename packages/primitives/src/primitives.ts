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
	const getRootKey = (keys: string[], preferredKey = 'mid') =>
		(() => {
			if (!keys.length) {
				throw new Error('Cannot derive $root from an empty token/value level');
			}
			return (
				(keys.includes(preferredKey) ?
					preferredKey
				:	keys[Math.floor(keys.length / 2)]) ?? keys[0]
			);
		})();
	const withRootValue = (
		values: Record<string, any>,
		preferredKey = 'mid',
		excludeKeys: string[] = ['$root'],
	) => {
		const keys = Object.keys(values).filter((key) => !excludeKeys.includes(key));
		const rootKey = getRootKey(keys, preferredKey);
		return {
			...values,
			$root: values[rootKey],
		};
	};
	const assignRootTokenAlias = (
		tokens: Record<string, any>,
		preferredKey = 'mid',
		excludeKeys: string[] = ['$root'],
	) => {
		const keys = Object.keys(tokens).filter((key) => !excludeKeys.includes(key));
		const rootKey = getRootKey(keys, preferredKey);
		tokens.$root = tokens[rootKey];
	};
	const colorsWithRoot = Object.fromEntries(
		Object.entries(colors).map(([schemeName, scheme]) => [
			schemeName,
			{
				...scheme,
				colors: Object.fromEntries(
					Object.entries(
						(scheme as { colors: Record<string, Record<string, any>> }).colors,
					).map(([colorName, color]) => {
						const colorValues = color as Record<string, any>;

						return [
							colorName,
							{
								...withRootValue(colorValues, 'mid', ['$neutral', '$root']),
								$neutral: withRootValue(colorValues.$neutral, 'mid'),
							},
						];
					},
					),
				),
			},
		]),
	) as unknown as TCompiledColors;
	const typographyWithRoot = {
		...config.typography,
		levels: {
			...config.typography.levels,
			$root: config.typography.levels[config.typography.defaultLevel],
		},
	} as TCompiledTypography;
	const spacingWithRoot = {
		...config.spacing,
		levels: {
			...config.spacing.levels,
			$root: config.spacing.levels[config.spacing.defaultLevel],
		},
	} as TCompiledSpacing;
	const shadowsWithRoot = {
		...config.shadows,
		levels: {
			...config.shadows.levels,
			$root: config.shadows.levels[config.shadows.defaultLevel],
		},
	} as TCompiledShadows;

	const arbitraryScheme = Object.values(colorsWithRoot)[0];
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
	for (const colorName in $colorProps) {
		const color = ($colorProps as any)[colorName];
		if (!color || typeof color !== 'object') {
			continue;
		}
		assignRootTokenAlias(color, 'mid', ['$neutral', '$root']);
		const neutral = color.$neutral;
		if (neutral && typeof neutral === 'object') {
			assignRootTokenAlias(neutral, 'mid');
		}
	}

	const $typographyProps = convertStructure(
		typographyWithRoot.levels,
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
	assignRootTokenAlias($typographyProps as any, typographyWithRoot.defaultLevel);

	const $spacingProps = convertStructure(
		spacingWithRoot.levels,
		(value): value is string | number =>
			typeof value === 'string' || typeof value === 'number',
		(_, path) =>
			createToken(`spacing-${path.join('-')}`, {
				type: 'length',
				purpose: 'spacing',
				tag: 's',
			}),
	);
	assignRootTokenAlias($spacingProps as any, spacingWithRoot.defaultLevel);

	const $shadowProps = convertStructure(
		shadowsWithRoot.levels,
		(value): value is string | number =>
			typeof value === 'string' || typeof value === 'number',
		(_, path) =>
			createToken(`shadow-${path.join('-')}`, {
				type: '*',
				purpose: 'shadow',
				tag: '🌫️',
			}),
	);
	assignRootTokenAlias($shadowProps as any, shadowsWithRoot.defaultLevel);

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
		colors: colorsWithRoot,
		typography: typographyWithRoot,
		spacing: spacingWithRoot,
		shadows: shadowsWithRoot,
		$tokens: {
			...(config.misc ?? ({} as TOtherTokens)),
			colors: $colorProps,
			typography: $typographyProps,
			spacing: $spacingProps,
			shadows: $shadowProps,
		},
	};
}
