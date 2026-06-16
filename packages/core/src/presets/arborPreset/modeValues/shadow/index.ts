import { css, Css } from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';

export const defaultShadowLevels = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type DefaultShadowLevel = (typeof defaultShadowLevels)[number];

export interface ShadowConfig<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	levels?: Record<TShadowLevel | 'none', CompiledShadowLevel>;
	defaultLevel?: TShadowLevel;
}

export interface CompiledShadowLevel {
	$root: string | Css;
	x: string | Css;
	y: string | Css;
	blur: string | Css;
	spread: string | Css;
	color: string | Css;
}

export function isCompiledShadowLevel(
	value: any,
): value is CompiledShadowLevel {
	return (
		value &&
		typeof value === 'object' &&
		['x', 'y', 'blur', 'spread', 'color'].every((prop) => prop in value)
	);
}

export type CompiledShadows<TShadowLevel extends string = DefaultShadowLevel> =
	{
		[K in TShadowLevel | 'none']: CompiledShadowLevel;
	};

const defaultShadowXCss = (step: number) => css`0px`;
const defaultShadowYCss = (step: number) =>
	css`calc(1px * pow(2, ${step} - 1))`;
const defaultShadowBlurCss = (step: number, $: RequiredTokens) => css`
	calc(${[$.shadowBlur, '0.5']} * ${[
		$.baseSpacingSize,
		'0.5rem',
	]} * 0.25 * pow(2, ${step} - 1))
`;
const defaultShadowSpreadCss = (step: number, $: RequiredTokens) => css`
	calc(${[$.shadowSpread, '0.5']} * 1px)
`;
const defaultShadowColorCss = (step: number, $: RequiredTokens) => css`
	${$.defaultShadowColor}
`;

type RequiredTokens = {
	shadowBlur: Token;
	shadowSpread: Token;
	baseSpacingSize: Token;
	defaultShadowColor: Token;
};

export function compileShadows<
	TShadowLevel extends string = DefaultShadowLevel,
>(
	config: ShadowConfig<TShadowLevel>,
	tokens: RequiredTokens,
): CompiledShadows<TShadowLevel> {
	const levelNames =
		config.levels ?
			Object.keys(config.levels)
		:	(defaultShadowLevels as unknown as TShadowLevel[]);

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TShadowLevel;
			const levelConfig = config.levels?.[nameCast];
			const x = defaultShadowXCss(i);
			const y = defaultShadowYCss(i);
			const blur = defaultShadowBlurCss(i, tokens);
			const spread = defaultShadowSpreadCss(i, tokens);
			const color = defaultShadowColorCss(i, tokens);
			const $root = css`
				${x} ${y} ${blur} ${spread} ${color}
			`;
			acc[nameCast] = {
				$root,
				x,
				y,
				blur,
				spread,
				color,
				...levelConfig,
			};
			return acc;
		},
		{} as Record<TShadowLevel, CompiledShadowLevel>,
	) as CompiledShadows<TShadowLevel>;

	levels['none'] = config.levels?.['none'] ?? {
		$root: '0 0 0 0 transparent',
		x: '0',
		y: '0',
		blur: '0',
		spread: '0',
		color: 'transparent',
	};

	return levels;
}
