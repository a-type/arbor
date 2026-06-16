import {
	css,
	Css,
	CssInterpolation,
	CssResolutionContext,
} from '@arbor-css/css-eval';
import { Token } from '@arbor-css/tokens';
import { oklchBuilder, OklchCssRepresentation } from './color.js';

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
	hue: CssInterpolation;
	/**
	 * 0-1, a local multiplier for chroma, stacks on global and computed value. Can also be a var() reference!
	 */
	saturation?: CssInterpolation;
	rangeNames?: readonly RangeNames[];
	defaultLevel?: RangeNames;
}

export interface ColorRangeCalculations {
	/** A computation for lightness at each step - resolve 0-1 */
	lightness: (details: {
		step: number;
		rangeSize: number;
		midpoint: number;
	}) => Css;
	/** A computation for chroma at each step - resolve 0-1 */
	chroma: (details: {
		step: number;
		rangeSize: number;
		midpoint: number;
	}) => Css;
	hue?: (details: { step: number; rangeSize: number; midpoint: number }) => Css;
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
	equation: OklchCssRepresentation;
	name: TRangeNames;
}

export type UncompiledColorRange<
	TRangeNames extends string = DefaultRangeName,
> = {
	[K in TRangeNames]: ColorRangeItem;
} & {
	$root: ColorRangeItem;
};
export type CompiledColorRange<TRangeNames extends string = DefaultRangeName> =
	{
		[K in TRangeNames]: string | Css;
	} & {
		$root: string | Css;
	};

export function createColorRange<RangeNames extends string = DefaultRangeName>(
	config: ColorRangeConfig<RangeNames>,
	calcs: ColorRangeCalculations,
	tokens: {
		saturation: Token;
	},
): UncompiledColorRange<RangeNames> {
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
			const equation = oklchBuilder(() => ({
				l: css`clamp(0, calc(${lightness({ step: i, rangeSize: size, midpoint })}), 1)`,
				c: css`clamp(0, calc(${config.saturation ?? 1} * 0.4 * ${chroma({ step: i, rangeSize: size, midpoint })} * ${tokens.saturation}), 0.4)`,
				h: css`calc(${sourceHue} * ${calcs.hue?.({ step: i, rangeSize: size, midpoint }) ?? 1})`,
			}));

			acc[name as RangeNames] = { name, equation };
			return acc;
		},
		{} as Record<RangeNames, ColorRangeItem>,
	) as UncompiledColorRange<RangeNames>;

	range.$root = (range as Record<string, ColorRangeItem>)[rootName as string];

	return range as any;
}

function lightnessEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
	midpointDifferentiation?: number;
}) {
	return ({
		step,
		rangeSize,
		midpoint,
	}: {
		step: number;
		rangeSize: number;
		midpoint: number;
	}) => {
		const rangeDir = step < midpoint ? -1 : 1;
		const rangeMax = step < midpoint ? midpoint : rangeSize - midpoint - 1;
		const rangeProgress =
			(Math.abs(step - midpoint) / rangeMax) **
			(config.midpointDifferentiation ?? 1.2);
		return css`calc(${config.baseline} + (${rangeDir} * ${rangeProgress} * ${step < midpoint ? config.rangeDown : config.rangeUp}))`;
	};
}

function chromaEq(config: {
	rangeDown: number;
	rangeUp: number;
	baseline: number;
	midpointDifferentiation?: number;
}) {
	return ({
		step,
		rangeSize,
		midpoint,
	}: {
		step: number;
		rangeSize: number;
		midpoint: number;
	}) => {
		const rangeDir = step < midpoint ? -1 : 1;
		const rangeMax = step < midpoint ? midpoint : rangeSize - midpoint - 1;
		const rangeProgress =
			(Math.abs(step - midpoint) / rangeMax) **
			(config.midpointDifferentiation ?? 1.2);

		return css`calc(${config.baseline} + (${rangeDir} * ${rangeProgress} * ${step < midpoint ? config.rangeDown : config.rangeUp}))`;
	};
}

export function createColorLightModeRange(
	config: ColorRangeConfig & {
		base?: number;
		scale?: number;
	},
	$: {
		saturation: Token;
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
	return createColorRange(
		config,
		{
			lightness,
			chroma,
		},
		$,
	);
}

export function createColorDarkModeRange(
	config: ColorRangeConfig & {
		base?: number;
		scale?: number;
	},
	$: {
		saturation: Token;
	},
) {
	const lightness = lightnessEq({
		rangeUp: -0.45,
		rangeDown: -0.85,
		baseline: 0.53,
	});
	const chroma = chromaEq({
		baseline: 0.8,
		rangeUp: -0.7,
		rangeDown: 0.48,
	});
	return createColorRange(
		config,
		{
			lightness,
			chroma,
		},
		$,
	);
}

export function createNeutralDerivedRange(
	sourceRange: UncompiledColorRange<string>,
	tokens: { saturation: Token },
	options?: {
		/** Adjust saturation relative to source range. Stacks with saturation token. */
		saturationFactor?: CssInterpolation;
	},
): UncompiledColorRange<string> {
	function lightness(source: OklchCssRepresentation) {
		return css`calc(${source.l} - pow(${source.c}, 1.7))`;
	}
	function chroma(source: OklchCssRepresentation) {
		const saturationFactor = options?.saturationFactor ?? 0.15;
		return css`calc(${source.c} * ${tokens.saturation} * ${saturationFactor})`;
	}

	return Object.fromEntries(
		Object.keys(sourceRange).map((sourceName) => {
			const sourceCss =
				sourceRange[sourceName as keyof typeof sourceRange].equation;
			const equation = oklchBuilder(() => ({
				l: css`clamp(0, ${lightness(sourceCss)}, 1)`,
				c: css`clamp(0, ${chroma(sourceCss)}, 0.4)`,
				h: sourceCss.h,
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

export function compileRange<R extends string>(
	range: UncompiledColorRange<R>,
	context: CssResolutionContext,
): CompiledColorRange<R> {
	return Object.fromEntries(
		Object.keys(range).map((name) => [
			name,
			range[name as keyof typeof range].equation.printComputed(context),
		]),
	) as CompiledColorRange<R>;
}
