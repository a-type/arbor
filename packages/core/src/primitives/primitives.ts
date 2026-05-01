import { ColorRangeItem, CompiledColors } from '@arbor-css/colors';
import {
	createGlobalProps,
	defaultGlobals,
	GlobalConfigProps,
	PrimitiveGlobals,
} from '@arbor-css/globals';
import { Token, TokenSchema } from '@arbor-css/tokens';
import { tokenifyColors } from '../util/tokenifyColors.js';
import { $systemProps } from './systemProps.js';

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	TCompiledColors extends CompiledColors<any, any>,
	TOtherTokens extends TokenSchema,
> {
	colors: TCompiledColors;
	misc?: TOtherTokens;
	defaultScheme?: keyof TCompiledColors;
	schemeTags?: Record<string, string>;
	globals?: Partial<PrimitiveGlobals>;
}

type StringsToTokens<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends string ? Token
	: T[K] extends Record<string, any> ? StringsToTokens<T[K]>
	: never;
};

export interface PrimitivesColorScheme {
	[Color: string]: ColorRangeItem[];
}

export type Primitives<
	TCompiledColors extends CompiledColors<any, any>,
	TOtherTokens extends TokenSchema,
> = {
	/**
	 * A map of color values, keyed by scheme name.
	 * Each entry is the same structure: a record of color name keys
	 * and string values which represent CSS colors.
	 */
	colors: TCompiledColors;
	defaultScheme: keyof TCompiledColors;
	schemeTags: Record<string, string>;
	globals: PrimitiveGlobals;
	$props: {
		system: typeof $systemProps;
		config: GlobalConfigProps;
	};
	$tokens: {
		colors: StringsToTokens<TCompiledColors[keyof TCompiledColors]>;
	} & TOtherTokens;
};

export function createPrimitives<
	TCompiledColors extends CompiledColors<any, any>,
	TOtherTokens extends TokenSchema,
>(
	config: PrimitivesConfig<TCompiledColors, TOtherTokens>,
): Primitives<TCompiledColors, TOtherTokens> {
	const { colors, defaultScheme, globals: userGlobals } = config;

	const arbitraryScheme = Object.values(colors)[0];
	if (!arbitraryScheme) {
		throw new Error('At least one color scheme must be defined in primitives');
	}
	// TODO: validate all scheme shapes are the same...
	const $colorProps = tokenifyColors(arbitraryScheme);

	const globals: PrimitiveGlobals = {
		...defaultGlobals,
		...userGlobals,
	};

	const schemeTags = {
		light: '☀️',
		dark: '🌑',
		...config.schemeTags,
	};

	const $configProps = createGlobalProps(globals);

	return {
		defaultScheme: defaultScheme ?? defaultDefaultScheme,
		schemeTags,
		globals,
		colors,
		$props: {
			system: $systemProps,
			config: $configProps,
		},
		$tokens: {
			...(config.misc ?? ({} as TOtherTokens)),
			colors: $colorProps,
		},
	};
}
