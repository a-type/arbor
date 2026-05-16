import { $, computeEquation, printComputationResult } from '@arbor-css/calc';
import { $globalProps, GlobalConfig } from '../../globals/dist/globalProps.js';

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

const defaultSpacingEquation = (step: number) =>
	$.multiply(
		// calculate rem value of the spacing relative to the
		// font size.
		$.divide(
			$.val($globalProps.baseSpacingSize.var),
			$.val($globalProps.baseFontSize.var),
		),
		$.val('1rem'),
		$.fn('pow', $.val(1.5), $.val(step)),
	);

export interface SpacingConfig<
	TSpacingLevel extends string = DefaultSpacingLevel,
> {
	levels?: Record<TSpacingLevel, string | number>;
	defaultLevel?: TSpacingLevel;
	globals?: GlobalConfig;
}

export interface CompiledSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
> {
	defaultLevel: TSpacingLevel;
	levels: {
		[K in TSpacingLevel]: string | number;
	} & {
		$root: string | number;
	};
}

export function compileSpacing<
	TSpacingLevel extends string = DefaultSpacingLevel,
>(config: SpacingConfig<TSpacingLevel>): CompiledSpacing<TSpacingLevel> {
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
							[$globalProps.baseSpacingSize.name]:
								config.globals?.baseSpacingSize?.toString(),
						},
					}),
				);
			return acc;
		},
		{} as Record<TSpacingLevel, string>,
	) as CompiledSpacing<TSpacingLevel>['levels'];
	const defaultLevel =
		config.defaultLevel ?? (levelNames[baseIndex] as TSpacingLevel);

	return {
		defaultLevel,
		levels: {
			...levels,
			$root: levels[defaultLevel],
		},
	};
}
