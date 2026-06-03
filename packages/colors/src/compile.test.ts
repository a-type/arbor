import { createGlobalContext } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors } from './compile.js';
import { createColorRange, defaultRangeNames } from './ranges.js';

const ctx = createGlobalContext();

it('compiles a set of color ranges with default schemes and no precalculated globals', () => {
	const compiled = compileColors(
		{
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
		},
		ctx,
	);

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "alt": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 210), oklch(0.5556387300380706 0.012000000000000002 210))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 210), oklch(0.9851654360090278 0.006300000000000001 210))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 210), oklch(0.02870654598684531 0.0015000000000000013 210))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 210), oklch(0.5556387300380706 0.012000000000000002 210))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 210), oklch(60% 0.16000000000000003 210))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 210), oklch(100% 0.08400000000000002 210))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 210), oklch(3.0000000000000027% 0.020000000000000018 210))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 210), oklch(60% 0.16000000000000003 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 90), oklch(0.9851654360090278 0.006300000000000001 90))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 90), oklch(0.02870654598684531 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 90), oklch(60% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 90), oklch(100% 0.08400000000000002 90))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 90), oklch(3.0000000000000027% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 90), oklch(60% 0.16000000000000003 90))",
		  },
		}
	`);
});

it('compiles a set of color ranges with a custom scheme', () => {
	const compiled = compileColors(
		{
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
		},
		ctx,
	);

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "alt": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0 0 210), oklch(0.5556387300380706 0.012000000000000002 210))",
		      "heavy": "light-dark(oklch(0 0 210), oklch(0.9851654360090278 0.006300000000000001 210))",
		      "light": "light-dark(oklch(0 0 210), oklch(0.02870654598684531 0.0015000000000000013 210))",
		      "mid": "light-dark(oklch(0 0 210), oklch(0.5556387300380706 0.012000000000000002 210))",
		    },
		    "$root": "light-dark(oklch(0% 0 210), oklch(60% 0.16000000000000003 210))",
		    "heavy": "light-dark(oklch(0% 0 210), oklch(100% 0.08400000000000002 210))",
		    "light": "light-dark(oklch(0% 0 210), oklch(3.0000000000000027% 0.020000000000000018 210))",
		    "mid": "light-dark(oklch(0% 0 210), oklch(60% 0.16000000000000003 210))",
		  },
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0 0 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0 0 90), oklch(0.9851654360090278 0.006300000000000001 90))",
		      "light": "light-dark(oklch(0 0 90), oklch(0.02870654598684531 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0 0 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(0% 0 90), oklch(60% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(0% 0 90), oklch(100% 0.08400000000000002 90))",
		    "light": "light-dark(oklch(0% 0 90), oklch(3.0000000000000027% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(0% 0 90), oklch(60% 0.16000000000000003 90))",
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
	const compiled = compileColors(
		{
			ranges: {
				primary: {
					hue: 90,
					rangeNames: ['heavy', 'mid', 'light'],
				},
			},
		},
		ctx,
	);

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "primary": {
		    "$neutral": {
		      "$root": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		      "heavy": "light-dark(oklch(0.17653786308766073 0.00825 90), oklch(0.9851654360090278 0.006300000000000001 90))",
		      "light": "light-dark(oklch(0.9996018928294464 0.0007500000000000007 90), oklch(0.02870654598684531 0.0015000000000000013 90))",
		      "mid": "light-dark(oklch(0.8602483517886919 0.011250000000000001 90), oklch(0.5556387300380706 0.012000000000000002 90))",
		    },
		    "$root": "light-dark(oklch(90% 0.15000000000000002 90), oklch(60% 0.16000000000000003 90))",
		    "heavy": "light-dark(oklch(20.000000000000007% 0.11000000000000001 90), oklch(100% 0.08400000000000002 90))",
		    "light": "light-dark(oklch(100% 0.010000000000000009 90), oklch(3.0000000000000027% 0.020000000000000018 90))",
		    "mid": "light-dark(oklch(90% 0.15000000000000002 90), oklch(60% 0.16000000000000003 90))",
		  },
		}
	`);
});

it('provides default range names', () => {
	const compiled = compileColors(
		{
			ranges: {
				primary: {
					hue: 90,
				},
			},
		},
		ctx,
	);

	for (const name of defaultRangeNames) {
		expect(compiled.primary).toHaveProperty(name);
	}
});

it('supports color-level saturation', () => {
	const compiled = compileColors(
		{
			ranges: {
				primaryLight: {
					hue: 90,
					saturation: 0.5,
				},
				primary: {
					hue: 90,
				},
			},
		},
		ctx,
	);

	const matchChroma = /oklch\((.*)\)/;
	expect(compiled.primaryLight.light).toMatch(matchChroma);
	expect(compiled.primary.light).toMatch(matchChroma);
	const lightChroma = compiled.primaryLight.light
		.match(matchChroma)?.[1]
		.split(' ')[1];
	const primaryChroma = compiled.primary.light
		.match(matchChroma)?.[1]
		.split(' ')[1];

	expect(lightChroma).toBeDefined();
	expect(primaryChroma).toBeDefined();
	expect(Number(lightChroma)).toBeCloseTo(Number(primaryChroma) * 0.5, 1);
});

it('supports hue defined as a CSS property', () => {
	const compiled = compileColors(
		{
			ranges: {
				primary: {
					hue: 'var(--my-hue)',
				},
			},
		},
		ctx,
	);

	expect(compiled.primary.light).toMatchInlineSnapshot(`"light-dark(oklch(98.02741561760232% 0.11253872711785591 var(--my-hue)), oklch(44.74791032655562% 0.12253872711785592 var(--my-hue)))"`);
});
