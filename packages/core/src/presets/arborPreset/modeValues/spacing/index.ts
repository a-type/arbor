import { css, Equation } from '@arbor-css/calc';
import { GlobalContext } from '@arbor-css/globals';

export const defaultSpacingLevels = [
	'2xs',
	'xs',
	'sm',
	'md',
	'lg',
	'xl',
	'2xl',
	'3xl',
] as const;
export type DefaultSpacingLevel = (typeof defaultSpacingLevels)[number];

const defaultSpacingEquation = (
	step: number,
	context: GlobalContext,
): Equation =>
	css`(${context.$systemTokens.global.baseSpacingSize} / ${context.$systemTokens.global.baseFontSize}) * 1rem * pow(1.5, ${step})`;

export interface SpacingConfig<
	TSpacingLevel extends string = DefaultSpacingLevel,
> {
	levels?: Record<TSpacingLevel, string | number>;
	defaultLevel?: TSpacingLevel;
}

export type CompiledSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
> = {
	[K in TSpacingLevel]: string | Equation;
} & {
	$root: string | Equation;
};

/**
 * Given configuration for spacing sizes and the default
 * level name, produces a range of spacing sizes.
 */
export function compileSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
>(
	config: SpacingConfig<TSpacingLevel>,
	context: GlobalContext,
): CompiledSpacing<TSpacingLevel> {
	const levelNames =
		config.levels ?
			Object.keys(config.levels)
		:	(defaultSpacingLevels as unknown as TSpacingLevel[]);

	const baseIndex =
		// user supplied explicit default level
		config.defaultLevel ? levelNames.indexOf(config.defaultLevel)
			// user did not give us a default level, but did give us custom levels, so we'll pick the middle one as the default
		: config.levels ? Math.floor(levelNames.length / 2)
			// user did not give us a default level, and is using the default levels, so we'll use 'md' as the default.
		: levelNames.indexOf('md' as TSpacingLevel);

	const levels = levelNames.reduce(
		(acc, name, i) => {
			const nameCast = name as TSpacingLevel;
			const levelConfig = config.levels?.[nameCast]?.toString();
			acc[nameCast] =
				levelConfig ?? defaultSpacingEquation(i - baseIndex, context);
			return acc;
		},
		{} as Record<TSpacingLevel, string | Equation>,
	) as CompiledSpacing<TSpacingLevel>;
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TSpacingLevel);

	return {
		...levels,
		$root: levels[defaultLevel],
	};
}
