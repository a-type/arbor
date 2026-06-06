import { css, Equation } from '@arbor-css/calc';
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
	$root: string | Equation;
	x: string | Equation;
	y: string | Equation;
	blur: string | Equation;
	spread: string | Equation;
	color: string | Equation;
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

const defaultShadowXEquation = (step: number) => css`0px`;
const defaultShadowYEquation = (step: number) => css`1px * pow(2, ${step} - 1)`;
const defaultShadowBlurEquation = (step: number, $: RequiredTokens) => css`
	${[$.shadowBlur, '0.5']} * ${[
		$.baseSpacingSize,
		'0.5rem',
	]} * 0.25 * pow(2, ${step} - 1)
`;
const defaultShadowSpreadEquation = (step: number, $: RequiredTokens) => css`
	${[$.shadowSpread, '0.5']} * 1px
`;
const defaultShadowColorEquation = (step: number, $: RequiredTokens) => css`
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

	const baseIndex =
		// user supplied explicit default level
		config.defaultLevel ? levelNames.indexOf(config.defaultLevel)
			// user did not give us a default level, but did give us custom levels, so we'll pick the middle one as the default
		: config.levels ? Math.floor(levelNames.length / 2)
			// user did not give us a default level, and is using the default levels, so we'll use 'md' as the default.
		: levelNames.indexOf('md' as TShadowLevel);

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TShadowLevel;
			const levelConfig = config.levels?.[nameCast];
			const x = defaultShadowXEquation(i);
			const y = defaultShadowYEquation(i);
			const blur = defaultShadowBlurEquation(i, tokens);
			const spread = defaultShadowSpreadEquation(i, tokens);
			const color = defaultShadowColorEquation(i, tokens);
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
