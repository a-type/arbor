import { css, Equation } from '@arbor-css/calc';
import { Token } from '@arbor-css/tokens';

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

export interface SpacingConfig<
	TSpacingLevel extends string = DefaultSpacingLevel,
> {
	levels?: Record<TSpacingLevel, string | number>;
	defaultLevel?: TSpacingLevel;
	/**
	 * The "base" number of the scale equation - a linear scalar
	 * multiplier. Set this to scale by some linear factor if
	 * scaleExponent is "1"
	 */
	scaleBase?: number | string | Equation;
	/**
	 * The exponent of the scale equation - the rate of exponential growth.
	 * `scaleBase` is raised to this exponent before being multiplied by the base spacing size.
	 * Set this to "1" to scale linearly by the `scaleBase` factor, or set it to a value greater than "1" to have exponential growth.
	 */
	scaleExponent?: number | string | Equation;
}

export type CompiledSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
> = {
	[K in TSpacingLevel]: string | Equation;
} & {
	$root: string | Equation;
};

type RequiredTokens = {
	baseSpacingSize: Token;
	baseFontSize: Token;
};

/**
 * Given configuration for spacing sizes and the default
 * level name, produces a range of spacing sizes.
 */
export function compileSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
>(
	config: SpacingConfig<TSpacingLevel>,
	$: RequiredTokens,
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
			const step = i - baseIndex;
			acc[nameCast] =
				levelConfig ??
				css`(${$.baseSpacingSize} / ${$.baseFontSize}) * 1rem * pow(${config.scaleBase ?? 2}, ${config.scaleExponent ?? 1.25} * ${step})`;
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
