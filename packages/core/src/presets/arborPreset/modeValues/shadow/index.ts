import { css, Equation } from '@arbor-css/calc';
import { GlobalContext } from '@arbor-css/globals';

export const defaultShadowLevels = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type DefaultShadowLevel = (typeof defaultShadowLevels)[number];

export interface ShadowConfig<
	TShadowLevel extends string = DefaultShadowLevel,
> {
	levels?: Record<TShadowLevel, CompiledShadowLevel>;
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
		[K in TShadowLevel]: CompiledShadowLevel;
	};

const defaultShadowXEquation = (step: number) => css`0px`;
const defaultShadowYEquation = (step: number) => css`1px * pow(2, ${step} - 1)`;
const defaultShadowBlurEquation = (step: number, context: GlobalContext) => css`
	${[context.$systemTokens.global.shadowBlur, '0.5']} * ${[
		context.$systemTokens.global.baseSpacingSize,
		'0.5rem',
	]} * 0.25 * pow(2, ${step} - 1)
`;
const defaultShadowSpreadEquation = (
	step: number,
	context: GlobalContext,
) => css`
	${[context.$systemTokens.global.shadowSpread, '0.5']} * 1px
`;
const defaultShadowColorEquation = (
	step: number,
	context: GlobalContext,
) => css`
	${context.$systemTokens.global.defaultShadowColor}
`;

export function compileShadows<
	TShadowLevel extends string = DefaultShadowLevel,
>(
	config: ShadowConfig<TShadowLevel>,
	context: GlobalContext,
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
			const blur = defaultShadowBlurEquation(i, context);
			const spread = defaultShadowSpreadEquation(i, context);
			const color = defaultShadowColorEquation(i, context);
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

	return levels;
}
