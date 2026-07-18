import { css, Css } from '@arbor-css/css-eval';
import { GlobalTokens } from '../../schema/global.js';

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
	roundToPixel?: boolean;
}

export type CompiledSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
> = {
	[K in TSpacingLevel]: string | Css;
} & {
	$root: string | Css;
};

/**
 * Given configuration for spacing sizes and the default
 * level name, produces a range of spacing sizes.
 */
export function compileSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
>(
	config: SpacingConfig<TSpacingLevel>,
	$: GlobalTokens,
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
				css`calc(${config.roundToPixel ? 'round(' : ''}${$.space.baseSize} * pow(${[$.space.scaleBase, 2]}, ${[$.space.scaleExponentStep, 1]} * ${step})${config.roundToPixel ? ', 1px)' : ''})`;
			return acc;
		},
		{} as Record<TSpacingLevel, string | Css>,
	) as CompiledSpacing<TSpacingLevel>;
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TSpacingLevel);

	return {
		...levels,
		$root: levels[defaultLevel],
	};
}
