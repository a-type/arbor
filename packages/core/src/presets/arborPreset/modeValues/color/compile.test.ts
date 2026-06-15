import {
	CalcEvaluationContext,
	computeEquation,
	css,
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
	const saturationToken = ctx.createModeToken('saturation');
	const compiled = compileColors(config, {
		saturation: saturationToken,
	});
	const computeCtx: CalcEvaluationContext = {
		propertyValues: {
			[saturationToken.name]: '0.5',
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
		      "$root": "light-dark(oklch(0.8602483518 0.01125 210), oklch(0.48563873 0.012 210))",
		      "heavy": "light-dark(oklch(0.1765378631 0.00825 210), oklch(0.9906565782 0.0048 210))",
		      "light": "light-dark(oklch(0.9996018928 0.00075 210), oklch(0.078706546 0.0015 210))",
		      "mid": "light-dark(oklch(0.8602483518 0.01125 210), oklch(0.48563873 0.012 210))",
		    },
		    "$root": "light-dark(oklch(0.9 0.15 210), oklch(0.53 0.16 210))",
		    "heavy": "light-dark(oklch(0.2 0.11 210), oklch(1 0.064 210))",
		    "light": "light-dark(oklch(1 0.01 210), oklch(0.08 0.02 210))",
		    "mid": "light-dark(oklch(0.9 0.15 210), oklch(0.53 0.16 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483518 0.01125 90), oklch(0.48563873 0.012 90))",
		      "heavy": "light-dark(oklch(0.1765378631 0.00825 90), oklch(0.9906565782 0.0048 90))",
		      "light": "light-dark(oklch(0.9996018928 0.00075 90), oklch(0.078706546 0.0015 90))",
		      "mid": "light-dark(oklch(0.8602483518 0.01125 90), oklch(0.48563873 0.012 90))",
		    },
		    "$root": "light-dark(oklch(0.9 0.15 90), oklch(0.53 0.16 90))",
		    "heavy": "light-dark(oklch(0.2 0.11 90), oklch(1 0.064 90))",
		    "light": "light-dark(oklch(1 0.01 90), oklch(0.08 0.02 90))",
		    "mid": "light-dark(oklch(0.9 0.15 90), oklch(0.53 0.16 90))",
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
							lightness: () => css`0`,
							chroma: () => css`0`,
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
		      "$root": "light-dark(oklch(0 0 210), oklch(0.48563873 0.012 210))",
		      "heavy": "light-dark(oklch(0 0 210), oklch(0.9906565782 0.0048 210))",
		      "light": "light-dark(oklch(0 0 210), oklch(0.078706546 0.0015 210))",
		      "mid": "light-dark(oklch(0 0 210), oklch(0.48563873 0.012 210))",
		    },
		    "$root": "light-dark(oklch(0 0 210), oklch(0.53 0.16 210))",
		    "heavy": "light-dark(oklch(0 0 210), oklch(1 0.064 210))",
		    "light": "light-dark(oklch(0 0 210), oklch(0.08 0.02 210))",
		    "mid": "light-dark(oklch(0 0 210), oklch(0.53 0.16 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0 0 90), oklch(0.48563873 0.012 90))",
		      "heavy": "light-dark(oklch(0 0 90), oklch(0.9906565782 0.0048 90))",
		      "light": "light-dark(oklch(0 0 90), oklch(0.078706546 0.0015 90))",
		      "mid": "light-dark(oklch(0 0 90), oklch(0.48563873 0.012 90))",
		    },
		    "$root": "light-dark(oklch(0 0 90), oklch(0.53 0.16 90))",
		    "heavy": "light-dark(oklch(0 0 90), oklch(1 0.064 90))",
		    "light": "light-dark(oklch(0 0 90), oklch(0.08 0.02 90))",
		    "mid": "light-dark(oklch(0 0 90), oklch(0.53 0.16 90))",
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

	expect(compiled.primaryLight.light).toMatchInlineSnapshot(
		`"light-dark(oklch(0.9802741562 0.0562693636 90), oklch(0.4095887657 0.0612693636 90))"`,
	);
	expect(compiled.primary.light).toMatchInlineSnapshot(
		`"light-dark(oklch(0.9802741562 0.1125387271 90), oklch(0.4095887657 0.1225387271 90))"`,
	);
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

	expect(compiled.primary.light).toMatchInlineSnapshot(
		`"light-dark(oklch(0.9802741562 0.1125387271 var(--my-hue)), oklch(0.4095887657 0.1225387271 var(--my-hue)))"`,
	);
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
