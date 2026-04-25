import { createGlobalProps } from '../primitives/globalsConfig.js';
import {
	ColorEquation,
	ColorEquationTools,
	ColorEvaluationContext,
	oklchBuilder,
	OklchColorEquation,
} from './color.js';
import { PropertyDefinition } from './properties.js';

// values not important, just need the names.
const $globalProps = createGlobalProps({});

export interface ColorRangeConfig {
	/** 0-360ish, OKLCH "H" hue */
	sourceHue: number;
	/** A computation for lightness at each step - resolve 0-1 */
	lightness: (
		tools: ColorEquationTools,
		details: { step: number; rangeSize: number },
	) => ColorEquation;
	/** A computation for chroma at each step - resolve 0-1 */
	chroma: (
		tools: ColorEquationTools,
		details: { step: number; rangeSize: number },
	) => ColorEquation;
	rangeNames: readonly string[];
	/** Pre-compute steps based on defined properties. */
	context: ColorEvaluationContext;
}

export interface ColorRangeItem {
	equation: OklchColorEquation;
	css: string;
	name: string;
}

export function createColorRange(config: ColorRangeConfig): ColorRangeItem[] {
	const { sourceHue, lightness, chroma, rangeNames, context } = config;
	const size = rangeNames.length;
	return new Array(size)
		.fill(0)
		.map((_, i) => {
			return oklchBuilder(($) => ({
				l: $.clamp(
					$.castPercentage(lightness($, { step: i, rangeSize: size })),
					$.literal('0%'),
					$.literal('100%'),
				),
				c: $.clamp(
					$.multiply(
						$.literal('0.4'),
						chroma($, { step: i, rangeSize: size }),
						$.literal($globalProps.saturation.var),
					),
					$.literal('0'),
					$.literal('0.4'),
				),
				h: $.literal(`${sourceHue}`),
			}));
		})
		.map((value, i) => ({
			equation: value,
			css: value.printComputed(context),
			name: rangeNames[i],
		}));
}

function presetLightnessRange({ dir = 1, base = 0.1, scale = 1.2 } = {}) {
	return function ($: ColorEquationTools, step: number, rangeSize: number) {
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

		return $.add($.literal(base), curve);
	};
}
// chroma: reduced at either end of the range
function presetChromaRange(
	$: ColorEquationTools,
	step: number,
	rangeSize: number,
	lift = 0,
) {
	return $.add(
		$.literal(0.1 + lift),
		$.multiply(
			$.fn(
				'pow',
				$.fn(
					'sin',
					$.add(
						$.multiply(
							// nudge the chroma upward a bit at the top end / down at the bottom end
							$.literal(step / rangeSize),
							$.literal('PI'),
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
}

export function createColorLightModeRange(
	config: Omit<ColorRangeConfig, 'lightness' | 'chroma'> & {
		base?: number;
		scale?: number;
	},
) {
	const lightness = presetLightnessRange({
		dir: 1,
		base: config.base ?? 0.4,
		scale: config.scale ?? 1.3,
	});
	return createColorRange({
		...config,
		lightness: ($, { step, rangeSize }) => lightness($, step, rangeSize),
		chroma: ($, { step, rangeSize }) => presetChromaRange($, step, rangeSize),
	});
}

export function createColorDarkModeRange(
	config: Omit<ColorRangeConfig, 'lightness' | 'chroma'> & {
		base?: number;
		scale?: number;
	},
) {
	const lightness = presetLightnessRange({
		dir: -1,
		base: config.base ?? 0.2,
		scale: config.scale ?? 0.7,
	});
	return createColorRange({
		...config,
		lightness: ($, { step, rangeSize }) => lightness($, step, rangeSize),
		chroma: ($, { step, rangeSize }) =>
			presetChromaRange($, step, rangeSize, 0.05),
	});
}

export function createNeutralDerivedRange(
	sourceColors: PropertyDefinition[],
	context: ColorEvaluationContext,
) {
	// converts to [-1...1] depending on where we sit in the light/dark
	// spectrum [0, 0.4]
	function lightness($: ColorEquationTools) {
		const fromL = $.add(
			$.literal('l'),
			$.multiply(
				$.divide(
					$.subtract($.literal('l'), $.literal('0.2')),
					$.literal('0.2'),
				),
				$.literal('-0.001'),
			),
		);
		return $.subtract(fromL, $.fn('pow', $.literal('c'), $.literal(1.6)));
	}
	function chroma($: ColorEquationTools) {
		return $.multiply(
			$.literal('c'),
			$.literal($globalProps.saturation.var),
			$.literal('0.15'),
		);
	}

	return Object.fromEntries(
		sourceColors.map((prop) => {
			return [
				prop.suffixed('neutral').name,
				oklchBuilder(($) => ({
					from: $.literal(prop.name),
					l: lightness($),
					c: chroma($),
					h: $.literal('h'),
				})).printComputed(context),
			];
		}),
	);
}
