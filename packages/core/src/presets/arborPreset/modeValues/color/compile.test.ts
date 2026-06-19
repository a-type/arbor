import {
	css,
	Css,
	CssResolutionContext,
	isCss,
	resolveCss,
} from '@arbor-css/css-eval';
import { simplifier } from '@arbor-css/css-eval/node';
import { createGlobalContext } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors, CompileColorsOptions } from './compile.js';
import { createColorRange, defaultRangeNames } from './ranges.js';

const ctx = createGlobalContext();

// helper to bake and print values for easier comparisons
function compileAndBake(config: CompileColorsOptions<string, string>) {
	const saturationToken = ctx.createModeToken('saturation');
	const compiled = compileColors(config, {
		color: { saturation: saturationToken },
	} as any);
	const computeCtx: CssResolutionContext = {
		propertyValues: {
			[saturationToken.name]: '0.5',
		},
		simplifier,
	};
	function bakeValues(
		values: Record<string, string | Css | Record<string, string | Css>>,
	) {
		const baked = {} as Record<string, any>;
		for (const rangeName in values) {
			const value = values[rangeName];
			if (typeof value === 'string' || typeof value === 'number') {
				baked[rangeName] = values[rangeName];
			} else if (isCss(value)) {
				baked[rangeName] = resolveCss(value, computeCtx);
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
		      "$root": "light-dark(oklch(86.0248% .01125 210), oklch(48.5639% .012 210))",
		      "heavy": "light-dark(oklch(17.6538% .00825 210), oklch(99.0657% .0048 210))",
		      "light": "light-dark(oklch(99.9602% .00075 210), oklch(7.87065% .0015 210))",
		      "mid": "light-dark(oklch(86.0248% .01125 210), oklch(48.5639% .012 210))",
		    },
		    "$root": "light-dark(oklch(90% .15 210), oklch(53% .16 210))",
		    "heavy": "light-dark(oklch(20% .11 210), oklch(100% .064 210))",
		    "light": "light-dark(oklch(100% .01 210), oklch(8% .02 210))",
		    "mid": "light-dark(oklch(90% .15 210), oklch(53% .16 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(86.0248% .01125 90), oklch(48.5639% .012 90))",
		      "heavy": "light-dark(oklch(17.6538% .00825 90), oklch(99.0657% .0048 90))",
		      "light": "light-dark(oklch(99.9602% .00075 90), oklch(7.87065% .0015 90))",
		      "mid": "light-dark(oklch(86.0248% .01125 90), oklch(48.5639% .012 90))",
		    },
		    "$root": "light-dark(oklch(90% .15 90), oklch(53% .16 90))",
		    "heavy": "light-dark(oklch(20% .11 90), oklch(100% .064 90))",
		    "light": "light-dark(oklch(100% .01 90), oklch(8% .02 90))",
		    "mid": "light-dark(oklch(90% .15 90), oklch(53% .16 90))",
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
		      "$root": "light-dark(oklch(0% 0 210), oklch(48.5639% .012 210))",
		      "heavy": "light-dark(oklch(0% 0 210), oklch(99.0657% .0048 210))",
		      "light": "light-dark(oklch(0% 0 210), oklch(7.87065% .0015 210))",
		      "mid": "light-dark(oklch(0% 0 210), oklch(48.5639% .012 210))",
		    },
		    "$root": "light-dark(oklch(0% 0 210), oklch(53% .16 210))",
		    "heavy": "light-dark(oklch(0% 0 210), oklch(100% .064 210))",
		    "light": "light-dark(oklch(0% 0 210), oklch(8% .02 210))",
		    "mid": "light-dark(oklch(0% 0 210), oklch(53% .16 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0% 0 90), oklch(48.5639% .012 90))",
		      "heavy": "light-dark(oklch(0% 0 90), oklch(99.0657% .0048 90))",
		      "light": "light-dark(oklch(0% 0 90), oklch(7.87065% .0015 90))",
		      "mid": "light-dark(oklch(0% 0 90), oklch(48.5639% .012 90))",
		    },
		    "$root": "light-dark(oklch(0% 0 90), oklch(53% .16 90))",
		    "heavy": "light-dark(oklch(0% 0 90), oklch(100% .064 90))",
		    "light": "light-dark(oklch(0% 0 90), oklch(8% .02 90))",
		    "mid": "light-dark(oklch(0% 0 90), oklch(53% .16 90))",
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
		`"light-dark(oklch(98.0274% .0562694 90), oklch(40.9589% .0612694 90))"`,
	);
	expect(compiled.primary.light).toMatchInlineSnapshot(
		`"light-dark(oklch(98.0274% .112539 90), oklch(40.9589% .122539 90))"`,
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

	// TODO: why is this not simplified?
	expect(compiled.primary.light).toMatchInlineSnapshot(
		`"light-dark(oklch(calc(clamp(0, calc(calc(.9 + (1 * .267581 * .3))), 1)) calc(clamp(0, calc(1 * .4 * calc(.75 + (1 * .267581 * -.7)) * .5), .4)) calc(calc(var(--my-hue) * 1))), oklch(calc(clamp(0, calc(calc(.53 + (1 * .267581 * -.45))), 1)) calc(clamp(0, calc(1 * .4 * calc(.8 + (1 * .267581 * -.7)) * .5), .4)) calc(calc(var(--my-hue) * 1))))"`,
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

it.only('assigns $root to midpoint when mid is absent', () => {
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
