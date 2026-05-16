import {
	CalcEvaluationContext,
	CalcOperations,
	Equation,
} from '@arbor-css/calc';
import { $globalProps } from '@arbor-css/globals';
import { oklchBuilder, OklchColorEquation } from './color.js';

export const defaultRangeNames = [
	'ink',
	'heavy',
	'mid',
	'light',
	'wash',
	'paper',
] as const;
export type DefaultRangeName = (typeof defaultRangeNames)[number];

export interface ColorRangeConfig<
	RangeNames extends string = DefaultRangeName,
> {
	/** 0-360ish, OKLCH "H" hue. Can also be a var() reference! */
	hue: number | string;
	rangeNames?: readonly RangeNames[];
	defaultLevel?: RangeNames;
	/** 0-1, a local multiplier for chroma, stacks on global and computed value. Can also be a var() reference! */
	saturation?: number | string;
}

export interface ColorRangeCalculations {
	/** A computation for lightness at each step - resolve 0-1 */
	lightness: (
		tools: CalcOperations,
		details: { step: number; rangeSize: number; midpoint: number },
	) => Equation;
	/** A computation for chroma at each step - resolve 0-1 */
	chroma: (
		tools: CalcOperations,
		details: { step: number; rangeSize: number; midpoint: number },
	) => Equation;
	hue?: (
		tools: CalcOperations,
		details: { step: number; rangeSize: number; midpoint: number },
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
} & {
	$root: ColorRangeItem;
};
export type CompiledColorRange<TRangeConfig extends ColorRangeConfig<string>> =
	{
		[K in InferRangeNames<TRangeConfig>]: string;
	} & {
		$root: string;
	};

export function createColorRange<RangeNames extends string = DefaultRangeName>(
	config: ColorRangeConfig<RangeNames>,
	calcs: ColorRangeCalculations,
): UncompiledColorRange<ColorRangeConfig<RangeNames>> {
	const {
		hue: sourceHue,
		rangeNames = defaultRangeNames as unknown as RangeNames[],
		defaultLevel,
	} = config;
	const { lightness, chroma } = calcs;
	const size = rangeNames.length;
	const rootName =
		rangeNames.find((name) => name === defaultLevel) ??
		rangeNames.find((name) => name === 'mid') ??
		rangeNames[Math.floor(size / 2)];
	const midpoint = rangeNames.indexOf(rootName);

	const range = rangeNames.reduce(
		(acc, name, i) => {
			const equation = oklchBuilder(($) => ({
				l: $.clamp(
					$.castPercentage(
						lightness($, { step: i, rangeSize: size, midpoint }),
					),
					$.val('0%'),
					$.val('100%'),
				),
				c: $.clamp(
					$.multiply(
						$.val(config.saturation ?? 1),
						$.val('0.4'),
						chroma($, { step: i, rangeSize: size, midpoint }),
						$.val($globalProps.saturation.var),
					),
					$.val('0'),
					$.val('0.4'),
				),
				h: $.multiply(
					$.val(`${sourceHue}`),
					calcs.hue?.($, { step: i, rangeSize: size, midpoint }) ?? $.val(1),
				),
			}));

			acc[name as RangeNames] = { name, equation };
			return acc;
		},
		{} as Record<RangeNames, ColorRangeItem>,
	) as UncompiledColorRange<ColorRangeConfig<RangeNames>>;

	range.$root = (range as Record<string, ColorRangeItem>)[rootName as string];

	return range as any;
}

function lightnessEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
	midpointDifferentiation?: number;
}) {
	return (
		$: CalcOperations,
		{
			step,
			rangeSize,
			midpoint,
		}: { step: number; rangeSize: number; midpoint: number },
	) => {
		const rangeDir = step < midpoint ? -1 : 1;
		const rangeMax = step < midpoint ? midpoint : rangeSize - midpoint - 1;
		const rangeProgress =
			(Math.abs(step - midpoint) / rangeMax) **
			(config.midpointDifferentiation ?? 1.2);
		return $.add(
			$.val(config.baseline),
			$.multiply(
				$.val(rangeDir),
				$.val(rangeProgress),
				$.val(step < midpoint ? config.rangeDown : config.rangeUp),
			),
		);
	};
}

function chromaEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
	midpointDifferentiation?: number;
}) {
	return (
		$: CalcOperations,
		{
			step,
			rangeSize,
			midpoint,
		}: { step: number; rangeSize: number; midpoint: number },
	) => {
		const rangeDir = step < midpoint ? -1 : 1;
		const rangeMax = step < midpoint ? midpoint : rangeSize - midpoint - 1;
		const rangeProgress =
			(Math.abs(step - midpoint) / rangeMax) **
			(config.midpointDifferentiation ?? 1.2);
		return $.add(
			$.val(config.baseline),
			$.multiply(
				$.val(rangeDir),
				$.val(rangeProgress),
				$.val(step < midpoint ? config.rangeDown : config.rangeUp),
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
	const lightness = lightnessEq({
		rangeUp: 0.3,
		rangeDown: 0.7,
		baseline: 0.9,
	});
	const chroma = chromaEq({
		baseline: 0.75,
		rangeUp: -0.7,
		rangeDown: 0.2,
	});
	return createColorRange(config, {
		lightness,
		chroma,
	});
}

export function createColorDarkModeRange(
	config: ColorRangeConfig & {
		base?: number;
		scale?: number;
	},
) {
	const lightness = lightnessEq({
		rangeUp: -0.38,
		rangeDown: -0.7,
		baseline: 0.6,
	});
	const chroma = chromaEq({
		baseline: 0.8,
		rangeUp: -0.7,
		rangeDown: 0.38,
	});
	return createColorRange(config, {
		lightness,
		chroma,
	});
}

export function createNeutralDerivedRange(
	sourceRange: UncompiledColorRange<ColorRangeConfig<string>>,
): UncompiledColorRange<ColorRangeConfig<string>> {
	function lightness($: CalcOperations, source: OklchColorEquation) {
		const sourceLAsZeroToOne = $.divide(source.l, $.val('100%'));
		return $.subtract(sourceLAsZeroToOne, $.fn('pow', source.c, $.val(1.7)));
	}
	function chroma($: CalcOperations, source: OklchColorEquation) {
		return $.multiply(
			source.c,
			$.val($globalProps.saturation.var),
			$.val('0.15'),
		);
	}

	return Object.fromEntries(
		Object.keys(sourceRange).map((sourceName) => {
			const sourceEquation =
				sourceRange[sourceName as keyof typeof sourceRange].equation;
			const equation = oklchBuilder(($) => ({
				l: $.clamp(lightness($, sourceEquation), $.val(0), $.val(1)),
				c: $.clamp(chroma($, sourceEquation), $.val(0), $.val(0.4)),
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
