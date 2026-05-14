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
					$.literal('0%'),
					$.literal('100%'),
				),
				c: $.clamp(
					$.multiply(
						$.literal(config.saturation ?? 1),
						$.literal('0.4'),
						chroma($, { step: i, rangeSize: size, midpoint }),
						$.literal($globalProps.saturation.var),
					),
					$.literal('0'),
					$.literal('0.4'),
				),
				h: $.multiply(
					$.literal(`${sourceHue}`),
					calcs.hue?.($, { step: i, rangeSize: size, midpoint }) ??
						$.literal(1),
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

function presetLightnessRange({
	dir = 1,
	base = 0.1,
	waveScale = 1.2,
	waveOffset = 0,
	grade = 1,
	waveMultiplier = 0.5,
} = {}) {
	return function ($: CalcOperations, step: number, rangeSize: number) {
		const inverseStep = rangeSize - step;
		const stepToUse = dir > 0 ? step : inverseStep;
		// inverse cosine curve
		const curve = $.subtract(
			$.literal(1),
			$.multiply(
				$.add(
					$.fn(
						'cos',
						$.add(
							$.literal((stepToUse / rangeSize) * (Math.PI * waveScale)),
							$.literal(waveOffset),
						),
					),
					$.literal(1),
				),
				$.literal(waveMultiplier),
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

// n        wash               light                          mid           dark                          ink
// light scheme
// l 90%   +(10%*1=10%)=100%   +(10%*0.5=5%)=95%             +0=90%        -(70%*0.35=24.5%)=65.5%       -(70%*1=70%)=20%
// c      (0.5*(75%-55%))=10%  (0.5*(75%-(55%*0.75))=16.875%  0.5*75%=37.5%   (0.5*(75%-(20%*0.5)))=32.5% (0.5*(75%-(20%*1)))=27.5%
// dark scheme
// l 60%   -(38%*1=38%)=22%      -(38%*0.5=19%)=41%             +0=60%         +(70%*0.35=24.5%)=84.5%      +(70%=70%)=100%
// c      (0.5*(80%+(-40%)))=20% (0.5*(80%+(-40%*0.75)))=25% (0.5*80%)=40% (0.5*(80%-(-30%*0.5)))=32.5%  (0.5*(80%-(-30%*1)))=25%

function lightnessEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
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
		const rangeProgress = Math.abs(step - midpoint) / rangeMax;
		return $.add(
			$.literal(config.baseline),
			$.multiply(
				$.literal(rangeDir),
				$.literal(rangeProgress),
				$.literal(step < midpoint ? config.rangeDown : config.rangeUp),
			),
		);
	};
}

function chromaEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
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
		const rangeProgress = Math.abs(step - midpoint) / rangeMax;
		return $.add(
			$.literal(config.baseline),
			$.multiply(
				$.literal(rangeDir),
				$.literal(rangeProgress),
				$.literal(step < midpoint ? config.rangeDown : config.rangeUp),
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
		rangeUp: 0.1,
		rangeDown: 0.7,
		baseline: 0.9,
	});
	const chroma = chromaEq({
		baseline: 0.75,
		rangeUp: -0.55,
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
