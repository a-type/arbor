import { ColorRangeItem, type CompiledColors } from '@arbor-css/colors';
import {
	isCompiledShadowLevel,
	type CompiledShadows,
} from '@arbor-css/shadows';
import { type CompiledSpacing } from '@arbor-css/spacing';
import { Token, type CreateToken } from '@arbor-css/tokens';
import {
	isTypographyLevel,
	type CompiledTypography,
} from '@arbor-css/typography';
import { convertStructure } from './util/convertStructure.js';

export interface CreatePrimitiveTokensConfig<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography<any>,
	TCompiledSpacing extends CompiledSpacing<any>,
	TCompiledShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
> {
	color?: TCompiledColors;
	typography?: TCompiledTypography;
	spacing?: TCompiledSpacing;
	shadow?: TCompiledShadows;
	easing?: TEasingFunctions;
	duration?: TDurations;
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

export function createPrimitiveTokens<
	TCompiledColors extends CompiledColors<any, any>,
	TCompiledTypography extends CompiledTypography<any>,
	TCompiledSpacing extends CompiledSpacing<any>,
	TCompiledShadows extends CompiledShadows<any>,
	TEasingFunctions extends Record<string, string>,
	TDurations extends Record<string, string>,
>(
	config: CreatePrimitiveTokensConfig<
		TCompiledColors,
		TCompiledTypography,
		TCompiledSpacing,
		TCompiledShadows,
		TEasingFunctions,
		TDurations
	>,
): PrimitiveTokens<
	TCompiledColors,
	TCompiledTypography,
	TCompiledSpacing,
	TCompiledShadows,
	TEasingFunctions,
	TDurations
> {
	const { color, typography, spacing, shadow, easing, duration, createToken } =
		config;

	const arbitraryScheme =
		color ? (Object.values(color)[0] ?? undefined) : undefined;

	const $colorProps =
		arbitraryScheme ?
			convertStructure(
				arbitraryScheme.colors,
				(item) => typeof item === 'string',
				(_, path) =>
					createToken(path.join('-'), {
						tag: 'color',
						type: 'color',
						purpose: 'color',
						group: path.slice(0, -1).join('-'),
					}),
			)
		:	{};

	const $typographyProps =
		typography ?
			convertStructure(typography.levels, isTypographyLevel, (_, path) => ({
				size: createToken(`${path.join('-')}-size`, {
					type: 'length',
					purpose: 'font-size',
					group: path.join('-'),
					tag: 'typography',
				}),
				weight: createToken(`${path.join('-')}-weight`, {
					type: '*',
					purpose: 'font-weight',
					group: path.join('-'),
					tag: 'typography',
				}),
				lineHeight: createToken(`${path.join('-')}-line-height`, {
					type: '*',
					purpose: 'line-height',
					group: path.join('-'),
					tag: 'typography',
				}),
			}))
		:	{};

	const $spacingProps =
		spacing ?
			convertStructure(
				spacing.levels,
				(value): value is string | number =>
					typeof value === 'string' || typeof value === 'number',
				(_, path) =>
					createToken(`${path.join('-')}`, {
						type: 'length',
						purpose: 'spacing',
						tag: 'spacing',
					}),
			)
		:	{};

	const $shadowProps =
		shadow ?
			convertStructure(shadow.levels, isCompiledShadowLevel, (_, path) => ({
				x: createToken(`${path.join('-')}-x`, {
					type: 'length',
					purpose: 'shadow-x',
					group: path.join('-'),
					tag: 'shadow',
				}),
				y: createToken(`${path.join('-')}-y`, {
					type: 'length',
					purpose: 'shadow-y',
					group: path.join('-'),
					tag: 'shadow',
				}),
				blur: createToken(`${path.join('-')}-blur`, {
					type: 'length',
					purpose: 'shadow-blur',
					group: path.join('-'),
					tag: 'shadow',
				}),
				spread: createToken(`${path.join('-')}-spread`, {
					type: 'length',
					purpose: 'shadow-spread',
					group: path.join('-'),
					tag: 'shadow',
				}),
				color: createToken(`${path.join('-')}-color`, {
					type: 'color',
					purpose: 'shadow-color',
					group: path.join('-'),
					tag: 'shadow',
				}),
			}))
		:	{};

	const $easingProps =
		easing ?
			convertStructure(
				easing,
				(value): value is string => typeof value === 'string',
				(_, path) =>
					createToken(`${path.join('-')}`, {
						type: 'string',
						purpose: 'easing-function',
						group: path.join('-'),
						tag: 'easing',
					}),
			)
		:	{};

	const $durationProps =
		duration ?
			convertStructure(
				duration,
				(value): value is string => typeof value === 'string',
				(_, path) =>
					createToken(`${path.join('-')}`, {
						type: 'string',
						purpose: 'duration',
						group: path.join('-'),
						tag: 'duration',
					}),
			)
		:	{};

	return {
		color: $colorProps,
		typography: $typographyProps,
		spacing: $spacingProps,
		shadow: $shadowProps,
		easing: $easingProps,
		duration: $durationProps,
	};
}
