import { ColorRangeItem, CompiledColors } from '@arbor-css/color-scheme';
import {
	createGlobalProps,
	defaultGlobals,
	PrimitiveGlobals,
} from '@arbor-css/globals';
import { Token } from '@arbor-css/tokens';
import { tokenifyColors } from '../util/tokenifyColors';
import { $labelProps } from './labelProps';

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	TCompiledColors extends CompiledColors<any, any>,
> {
	colors: TCompiledColors;
	defaultScheme: keyof TCompiledColors;
	schemeTags?: Record<string, string>;
	globals: PrimitiveGlobals;
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
	colors: TCompiledColors;
	defaultScheme: keyof TCompiledColors;
	schemeTags: Record<string, string>;
	globals: PrimitiveGlobals;
	$props: {
		labels: typeof $labelProps;
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
			colors: $colorProps as any,
			user: userProps,
		},
	};
}
