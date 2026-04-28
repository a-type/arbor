import {
	createGlobalProps,
	defaultGlobals,
	PrimitiveGlobals,
} from '@arbor-css/globals';
import { ColorRangeItem, CompiledColors } from '@arbor-css/schemes';
import { Token } from '@arbor-css/tokens';
import { tokenifyColors } from '../util/tokenifyColors';
import { $labelProps } from './labelProps';
import { $systemProps } from './systemProps';

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	TCompiledColors extends CompiledColors<any, any>,
> {
	colors: TCompiledColors;
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

export type Primitives<TCompiledColors extends CompiledColors<any, any>> = {
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
		labels: typeof $labelProps;
		system: typeof $systemProps;
		colors: StringsToTokens<TCompiledColors[keyof TCompiledColors]>;
		user: {
			saturation: Token;
		};
	};
};

export function createPrimitives<
	TCompiledColors extends CompiledColors<any, any>,
>(config: PrimitivesConfig<TCompiledColors>): Primitives<TCompiledColors> {
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

	const userProps = createGlobalProps(globals);

	return {
		defaultScheme: defaultScheme ?? defaultDefaultScheme,
		schemeTags,
		globals,
		colors,
		$props: {
			labels: $labelProps,
			system: $systemProps,
			colors: $colorProps as any,
			user: userProps,
		},
	};
}
