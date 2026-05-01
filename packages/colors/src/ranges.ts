import {
	CalcEvaluationContext,
	CalcOperations,
	Equation,
} from '@arbor-css/calc';
import { createGlobalProps } from '@arbor-css/globals';
import { oklchBuilder, OklchColorEquation } from './color.js';

// values not important, just need the names.
const $globalProps = createGlobalProps({});

export const defaultRangeNames = [
	'ink',
	'heavier',
	'heavy',
	'mid',
	'light',
	'lighter',
	'wash',
	'paper',
] as const;
export type DefaultRangeName = (typeof defaultRangeNames)[number];

export interface ColorRangeConfig<
	RangeNames extends string = DefaultRangeName,
> {
	/** 0-360ish, OKLCH "H" hue */
	hue: number;
	rangeNames?: readonly RangeNames[];
	/** 0-1, a local multiplier for chroma, stacks on global and computed value */
	saturation?: number;
}

export interface ColorRangeCalculations {
	/** A computation for lightness at each step - resolve 0-1 */
	lightness: (
		tools: CalcOperations,
		details: { step: number; rangeSize: number },
	) => Equation;
	/** A computation for chroma at each step - resolve 0-1 */
	chroma: (
		tools: CalcOperations,
		details: { step: number; rangeSize: number },
	) => Equation;
}

export type InferRangeNames<Config> =
	Config extends ColorRangeConfig<infer RangeNames> ?
		// tests if the generic was left as "string" (not supplied), in which
		// case it is replaced with defaults, as that's what the code in createColorRange does.
		'!!!do_not_use_this_name' extends RangeNames ?
			DefaultRangeName
		:	RangeNames
	:	never;

export interface ColorRangeItem<TRangeNames extends string = string> {
	equation: OklchColorEquation;
	name: TRangeNames;
}

export type UncompiledColorRange<
	TRangeConfig extends ColorRangeConfig<string>,
> = {
	[K in InferRangeNames<TRangeConfig>]: ColorRangeItem;
};
export type CompiledColorRange<TRangeConfig extends ColorRangeConfig<string>> =
	{
		[K in InferRangeNames<TRangeConfig>]: string;
	};

export function createColorRange<RangeNames extends string = DefaultRangeName>(
	config: ColorRangeConfig<RangeNames>,
	calcs: ColorRangeCalculations,
): UncompiledColorRange<ColorRangeConfig<RangeNames>> {
	const { hue: sourceHue, rangeNames = defaultRangeNames } = config;
	const { lightness, chroma } = calcs;
	const size = rangeNames.length;

	return rangeNames.reduce(
		(acc, name, i) => {
			const equation = oklchBuilder(($) => ({
				l: $.clamp(
					$.castPercentage(lightness($, { step: i, rangeSize: size })),
					$.literal('0%'),
					$.literal('100%'),
				),
				c: $.clamp(
					$.multiply(
						$.literal(config.saturation ?? 1),
						$.literal('0.4'),
						chroma($, { step: i, rangeSize: size }),
						$.literal($globalProps.saturation.var),
					),
					$.literal('0'),
					$.literal('0.4'),
				),
				h: $.literal(`${sourceHue}`),
			}));

			acc[name as RangeNames] = { name, equation };
			return acc;
		},
		{} as Record<RangeNames, ColorRangeItem>,
	) as any;
}

function presetLightnessRange({
	dir = 1,
	base = 0.1,
	scale = 1.2,
	grade = 1,
} = {}) {
	return function ($: CalcOperations, step: number, rangeSize: number) {
		const inverseStep = rangeSize - step;
		const stepToUse = dir > 0 ? step : inverseStep;
		// inverse cosine curve
		const curve = $.subtract(
			$.literal(1),
			$.divide(
				$.add(
					$.fn('cos', $.literal((stepToUse / rangeSize) * (Math.PI * scale))),
					$.literal(1),
				),
				$.literal(2),
			),
		);

		const baseSlope = $.multiply(
			$.literal(base),
			$.literal(grade),
			$.literal(stepToUse / rangeSize),
		);

		return $.add(baseSlope, curve);
	};
}
// chroma: reduced at either end of the range
function presetChromaRange({ base = 0.1, scale = 1.2, grade = 1 }) {
	return function ($: CalcOperations, step: number, rangeSize: number) {
		const baseSlope = $.multiply(
			$.literal(base),
			$.literal(grade),
			$.literal(step / rangeSize),
		);

		return $.add(
			baseSlope,
			$.multiply(
				$.fn(
					'pow',
					$.fn(
						'sin',
						$.add(
							$.multiply(
								// nudge the chroma upward a bit at the top end / down at the bottom end
								$.literal(step / rangeSize),
								$.literal(Math.PI * scale),
								$.literal(0.8),
							),
							$.literal(0.5),
						),
					),
					$.literal(2),
				),
				$.literal(0.7),
			),
		);
	};
}

export function createColorLightModeRange(
	config: ColorRangeConfig & {
		base?: number;
		scale?: number;
	},
) {
	const lightness = presetLightnessRange({
		dir: 1,
		base: config.base ?? 0.8,
		scale: config.scale ?? 1.5,
	});
	const chroma = presetChromaRange({
		base: 0.05,
		scale: 1.1,
	});
	return createColorRange(config, {
		lightness: ($, { step, rangeSize }) => lightness($, step, rangeSize),
		chroma: ($, { step, rangeSize }) => chroma($, step, rangeSize),
	});
}

export function createColorDarkModeRange(
	config: ColorRangeConfig & {
		base?: number;
		scale?: number;
	},
) {
	const lightness = presetLightnessRange({
		dir: -1,
		base: config.base ?? 0.1,
		// larger = upper range is brighter
		scale: config.scale ?? 0.9,
		grade: 0.8,
	});
	const chroma = presetChromaRange({
		base: 0.5,
		// larger = lower range is desaturated
		scale: 1.1,
		grade: 1.3,
	});
	return createColorRange(config, {
		lightness: ($, { step, rangeSize }) => lightness($, step, rangeSize),
		chroma: ($, { step, rangeSize }) => chroma($, step, rangeSize),
	});
}

export function createNeutralDerivedRange(
	sourceRange: UncompiledColorRange<ColorRangeConfig<string>>,
): UncompiledColorRange<ColorRangeConfig<string>> {
	function lightness($: CalcOperations, source: OklchColorEquation) {
		const sourceLAsZeroToOne = $.divide(source.l, $.literal('100%'));
		const fromL = $.add(
			sourceLAsZeroToOne,
			$.multiply(
				$.divide(
					$.subtract(sourceLAsZeroToOne, $.literal('0.2')),
					$.literal('0.2'),
				),
				$.literal('-0.001'),
			),
		);
		return $.subtract(fromL, $.fn('pow', source.c, $.literal(1.6)));
	}
	function chroma($: CalcOperations, source: OklchColorEquation) {
		return $.multiply(
			source.c,
			$.literal($globalProps.saturation.var),
			$.literal('0.15'),
		);
	}

	return Object.fromEntries(
		Object.keys(sourceRange).map((sourceName) => {
			const sourceEquation =
				sourceRange[sourceName as keyof typeof sourceRange].equation;
			const equation = oklchBuilder(($) => ({
				l: $.clamp(lightness($, sourceEquation), $.literal(0), $.literal(1)),
				c: $.clamp(chroma($, sourceEquation), $.literal(0), $.literal(0.4)),
				h: sourceEquation.h,
			}));
			return [
				sourceName,
				{
					name: sourceName,
					equation,
				},
			];
		}),
	) as any;
}

export function compileRange<
	R extends string,
	TRanges extends Record<string, ColorRangeConfig>,
>(
	range: UncompiledColorRange<TRanges[R]>,
	context: CalcEvaluationContext,
): CompiledColorRange<TRanges[R]> {
	return Object.fromEntries(
		Object.keys(range).map((name) => [
			name,
			range[name as keyof typeof range].equation.printComputed(context),
		]),
	) as CompiledColorRange<TRanges[R]>;
}
