import { createGlobals, GlobalConfig } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors } from './compile.js';
import { createColorRange, defaultRangeNames } from './ranges.js';

it('compiles a set of color ranges with default schemes and no precalculated globals', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
			alt: {
				hue: 210,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "dark": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.9501231630155053 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.181852115991663 - pow(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.5526304228576756 - pow(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "dark": "oklch(95.38926261462365% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(18.17609205946362% calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(55.44024350328398% calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.9501231630155053 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.181852115991663 - pow(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.5526304228576756 - pow(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "dark": "oklch(95.38926261462365% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(18.17609205946362% calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(55.44024350328398% calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "dark": "oklch(0% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(100% calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "dark": "oklch(0% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(100% calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": false,
		  },
		}
	`);
});

it('compiles a set of color ranges with a custom scheme', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
			alt: {
				hue: 210,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {
			custom: {
				tag: '👌',
				getColorRange: (config) =>
					createColorRange(config, {
						lightness: ($) => $.literal('0'),
						chroma: ($) => $.literal('0'),
					}),
				isDark: true,
			},
		},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "custom": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "dark": "oklch(0.001 0 210)",
		          "light": "oklch(0.001 0 210)",
		          "mid": "oklch(0.001 0 210)",
		        },
		        "dark": "oklch(0% 0 210)",
		        "light": "oklch(0% 0 210)",
		        "mid": "oklch(0% 0 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(0.001 0 90)",
		          "light": "oklch(0.001 0 90)",
		          "mid": "oklch(0.001 0 90)",
		        },
		        "dark": "oklch(0% 0 90)",
		        "light": "oklch(0% 0 90)",
		        "mid": "oklch(0% 0 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "dark": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.9501231630155053 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.181852115991663 - pow(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.5526304228576756 - pow(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "dark": "oklch(95.38926261462365% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(18.17609205946362% calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(55.44024350328398% calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.9501231630155053 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.181852115991663 - pow(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.5526304228576756 - pow(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "dark": "oklch(95.38926261462365% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(18.17609205946362% calc(clamp(0, calc(0.40282945818358507 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(55.44024350328398% calc(clamp(0, calc(0.3717340270483959 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "dark": "oklch(0% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(100% calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "dark": "oklch(0% calc(clamp(0, calc(0.06435767717846044 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(100% calc(clamp(0, calc(0.1570084151476001 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.28047465605662286 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": false,
		  },
		}
	`);
});

it('precomputes colors when globals are provided', () => {
	const globals: GlobalConfig = createGlobals({
		saturation: 0.5,
	});
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {},
		globals,
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "dark": {
		    "colors": {
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(0.9460294953320025 0.0024134128941922664 90)",
		          "light": "oklch(0.10484232184874683 0.01510610468188444 90)",
		          "mid": "oklch(0.4849093681477608 0.013940026014314847 90)",
		        },
		        "dark": "oklch(95.38926261462365% 0.03217883858923022 90)",
		        "light": "oklch(18.17609205946362% 0.20141472909179253 90)",
		        "mid": "oklch(55.44024350328398% 0.18586701352419796 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "primary": {
		        "$neutral": {
		          "dark": "oklch(0 0.0024134128941922664 90)",
		          "light": "oklch(0.9789459043417997 0.005887815568035004 90)",
		          "mid": "oklch(0.7206832334318378 0.010517799602123358 90)",
		        },
		        "dark": "oklch(0% 0.03217883858923022 90)",
		        "light": "oklch(100% 0.07850420757380006 90)",
		        "mid": "oklch(76.66666666666666% 0.14023732802831143 90)",
		      },
		    },
		    "isDark": false,
		  },
		}
	`);
});

it('provides default range names', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
			},
		},
		schemes: {},
	});

	for (const name of defaultRangeNames) {
		expect(compiled.dark.colors.primary).toHaveProperty(name);
	}
});

it('supports color-level saturation', () => {
	const compiled = compileColors({
		ranges: {
			primaryLight: {
				hue: 90,
				saturation: 0.5,
			},
			primary: {
				hue: 90,
			},
		},
		schemes: {},
		globals: {
			saturation: 1,
		},
	});

	const matchChroma = /oklch\((.*)\)/;
	expect(compiled.dark.colors.primaryLight.light).toMatch(matchChroma);
	expect(compiled.dark.colors.primary.light).toMatch(matchChroma);
	const lightChroma = compiled.dark.colors.primaryLight.light
		.match(matchChroma)?.[1]
		.split(' ')[1];
	const primaryChroma = compiled.dark.colors.primary.light
		.match(matchChroma)?.[1]
		.split(' ')[1];

	expect(lightChroma).toBeDefined();
	expect(primaryChroma).toBeDefined();
	expect(Number(lightChroma)).toBeCloseTo(Number(primaryChroma) * 0.5, 1);
});

it('supports hue defined as a CSS property', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 'var(--my-hue)',
			},
		},
		schemes: {},
	});

	expect(compiled.dark.colors.primary.light).toMatchInlineSnapshot(
		`"oklch(35.30047501302266% calc(clamp(0, calc(0.4304405175709162 * var(--🧑-sat)), 0.4)) var(--my-hue))"`,
	);
});
