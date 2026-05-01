import { $, computeEquation, printComputationResult } from '@arbor-css/calc';
import { $globalPropsUnset, PrimitiveGlobals } from '@arbor-css/globals';

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

const defaultSpacingEquation = (step: number) =>
	$.multiply(
		$.literal($globalPropsUnset.spacingUnitPixels.name),
		$.fn('pow', $.literal(1.5), $.literal(step)),
	);

export interface SpacingConfig<TSpacingLevel extends string> {
	levels?: Record<TSpacingLevel, string | number>;
	defaultLevel?: TSpacingLevel;
	globals?: PrimitiveGlobals;
}

export interface Spacing<TSpacingLevel extends string> {
	defaultLevel: TSpacingLevel;
	levels: {
		[K in TSpacingLevel]: string | number;
	};
}

export function compileSpacing<TSpacingLevel extends string>(
	config: SpacingConfig<TSpacingLevel>,
): Spacing<TSpacingLevel> {
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
				levelConfig ??
				printComputationResult(
					computeEquation(defaultSpacingEquation(i - baseIndex), {
						propertyValues: {
							[$globalPropsUnset.spacingUnitPixels.name]:
								config.globals?.spacingUnitPixels?.toString(),
						},
					}),
				);
			return acc;
		},
		{} as Record<TSpacingLevel, string>,
	) as Spacing<TSpacingLevel>['levels'];

	return {
		defaultLevel:
			config.defaultLevel ?? (levelNames[baseIndex] as TSpacingLevel),
		levels,
	};
}
