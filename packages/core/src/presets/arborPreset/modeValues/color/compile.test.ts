import {
	CalcEvaluationContext,
	computeEquation,
	Equation,
	isCalcEquation,
	printComputationResult,
} from '@arbor-css/calc';
import { createGlobalContext } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors, CompileColorsOptions } from './compile.js';
import { createColorRange, defaultRangeNames } from './ranges.js';

const ctx = createGlobalContext();

// helper to bake and print values for easier comparisons
function compileAndBake(config: CompileColorsOptions<string, string>) {
	const compiled = compileColors(config, ctx);
	const computeCtx: CalcEvaluationContext = {
		propertyValues: {
			[ctx.$systemTokens.global.saturation.name]: '0.5',
		},
	};
	function bakeValues(
		values: Record<
			string,
			string | Equation | Record<string, string | Equation>
		>,
	) {
		const baked = {} as Record<string, any>;
		for (const rangeName in values) {
			const value = values[rangeName];
			if (typeof value === 'string' || typeof value === 'number') {
				baked[rangeName] = values[rangeName];
			} else if (isCalcEquation(value)) {
				baked[rangeName] = printComputationResult(
					computeEquation(value, computeCtx),
				);
			} else if (typeof value === 'object' && value) {
				baked[rangeName] = bakeValues(value);
			}
		}
		return baked;
	}
	return bakeValues(compiled);
}

it('compiles a set of color ranges with default schemes and no precalculated globals', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['heavy', 'mid', 'light'],
			},
			alt: {
				hue: 210,
				rangeNames: ['heavy', 'mid', 'light'],
			},
		},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "alt": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 210), oklch(0.4856387300380706 0.012000000000000002 210))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 210), oklch(0.9906565781856719 0.004800000000000001 210))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 210), oklch(0.0787065459868453 0.0015000000000000013 210))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 210), oklch(0.4856387300380706 0.012000000000000002 210))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 210), oklch(53% 0.16000000000000003 210))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 210), oklch(100% 0.06400000000000002 210))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 210), oklch(8.000000000000002% 0.020000000000000018 210))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 210), oklch(53% 0.16000000000000003 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 90), oklch(0.9906565781856719 0.004800000000000001 90))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 90), oklch(0.0787065459868453 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 90), oklch(53% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 90), oklch(100% 0.06400000000000002 90))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 90), oklch(8.000000000000002% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 90), oklch(53% 0.16000000000000003 90))",
		  },
		}
	`);
});

it('compiles a set of color ranges with a custom scheme', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['heavy', 'mid', 'light'],
			},
			alt: {
				hue: 210,
				rangeNames: ['heavy', 'mid', 'light'],
			},
		},
		schemes: {
			light: {
				tag: 'light-custom',
				getColorRange: (config, ctx) =>
					createColorRange(
						config,
						{
							lightness: ($) => $.val('0'),
							chroma: ($) => $.val('0'),
						},
						ctx,
					),
				isDark: true,
			},
		},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "alt": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0 0 210), oklch(0.4856387300380706 0.012000000000000002 210))",
		      "heavy": "light-dark(oklch(0 0 210), oklch(0.9906565781856719 0.004800000000000001 210))",
		      "light": "light-dark(oklch(0 0 210), oklch(0.0787065459868453 0.0015000000000000013 210))",
		      "mid": "light-dark(oklch(0 0 210), oklch(0.4856387300380706 0.012000000000000002 210))",
		    },
		    "$root": "light-dark(oklch(0% 0 210), oklch(53% 0.16000000000000003 210))",
		    "heavy": "light-dark(oklch(0% 0 210), oklch(100% 0.06400000000000002 210))",
		    "light": "light-dark(oklch(0% 0 210), oklch(8.000000000000002% 0.020000000000000018 210))",
		    "mid": "light-dark(oklch(0% 0 210), oklch(53% 0.16000000000000003 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0 0 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0 0 90), oklch(0.9906565781856719 0.004800000000000001 90))",
		      "light": "light-dark(oklch(0 0 90), oklch(0.0787065459868453 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0 0 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(0% 0 90), oklch(53% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(0% 0 90), oklch(100% 0.06400000000000002 90))",
		    "light": "light-dark(oklch(0% 0 90), oklch(8.000000000000002% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(0% 0 90), oklch(53% 0.16000000000000003 90))",
		  },
		}
	`);
});

it('precomputes colors when globals are provided', () => {
	const ctx = createGlobalContext({
		globals: {
			saturation: 0.5,
		},
	});
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['heavy', 'mid', 'light'],
			},
		},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 90), oklch(0.9906565781856719 0.004800000000000001 90))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 90), oklch(0.0787065459868453 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.4856387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 90), oklch(53% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 90), oklch(100% 0.06400000000000002 90))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 90), oklch(8.000000000000002% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 90), oklch(53% 0.16000000000000003 90))",
		  },
		}
	`);
});

it('provides default range names', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
			},
		},
	});

	for (const name of defaultRangeNames) {
		expect(compiled.primary).toHaveProperty(name);
	}
});

it('supports color-level saturation', () => {
	const compiled = compileAndBake({
		ranges: {
			primaryLight: {
				hue: 90,
				saturation: 0.5,
			},
			primary: {
				hue: 90,
			},
		},
	});

	expect(compiled.primaryLight.light).toMatchInlineSnapshot(`"light-dark(oklch(98.02741561760232% 0.056269363558927955 90), oklch(40.95887657359654% 0.06126936355892796 90))"`);
	expect(compiled.primary.light).toMatchInlineSnapshot(`"light-dark(oklch(98.02741561760232% 0.11253872711785591 90), oklch(40.95887657359654% 0.12253872711785592 90))"`);
	expect(compiled.primaryLight.light).not.toEqual(compiled.primary.light);
});

it('supports hue defined as a CSS property', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 'var(--my-hue)',
			},
		},
	});

	expect(compiled.primary.light).toMatchInlineSnapshot(`"light-dark(oklch(98.02741561760232% 0.11253872711785591 var(--my-hue)), oklch(40.95887657359654% 0.12253872711785592 var(--my-hue)))"`);
});

it('assigns color and neutral $root to mid when mid exists', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['heavy', 'mid', 'light'],
			},
		},
	});

	expect(compiled.primary.$root).toBe(compiled.primary.mid);
	expect(compiled.primary.$neutral.$root).toBe(compiled.primary.$neutral.mid);
});

it('assigns $root to midpoint when mid is absent', () => {
	const compiled = compileAndBake({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['low', 'high'] as const,
			},
		},
	});

	expect(compiled.primary.$root).toBe(compiled.primary.high);
	expect(compiled.primary.$neutral.$root).toBe(compiled.primary.$neutral.high);
});
