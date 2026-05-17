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
		          "$root": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "dark": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.21999999999999997 - calc(pow(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "$root": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 210)",
		        "dark": "oklch(100% calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(21.999999999999996% calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "dark": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.21999999999999997 - calc(pow(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "$root": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 90)",
		        "dark": "oklch(100% calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(21.999999999999996% calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "dark": "oklch(calc(clamp(0, calc(0.20000000000000007 - calc(pow(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "$root": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 210)",
		        "dark": "oklch(20.000000000000007% calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(100% calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "dark": "oklch(calc(clamp(0, calc(0.20000000000000007 - calc(pow(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "$root": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 90)",
		        "dark": "oklch(20.000000000000007% calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(100% calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 90)",
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
						lightness: ($) => $.val('0'),
						chroma: ($) => $.val('0'),
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
		          "$root": "oklch(calc(clamp(0, 0%, 1)) 0 210)",
		          "dark": "oklch(calc(clamp(0, 0%, 1)) 0 210)",
		          "light": "oklch(calc(clamp(0, 0%, 1)) 0 210)",
		          "mid": "oklch(calc(clamp(0, 0%, 1)) 0 210)",
		        },
		        "$root": "oklch(0% 0 210)",
		        "dark": "oklch(0% 0 210)",
		        "light": "oklch(0% 0 210)",
		        "mid": "oklch(0% 0 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, 0%, 1)) 0 90)",
		          "dark": "oklch(calc(clamp(0, 0%, 1)) 0 90)",
		          "light": "oklch(calc(clamp(0, 0%, 1)) 0 90)",
		          "mid": "oklch(calc(clamp(0, 0%, 1)) 0 90)",
		        },
		        "$root": "oklch(0% 0 90)",
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
		          "$root": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "dark": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(0.21999999999999997 - calc(pow(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "$root": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 210)",
		        "dark": "oklch(100% calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(21.999999999999996% calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "dark": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(0.21999999999999997 - calc(pow(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.6 - calc(pow(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "$root": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 90)",
		        "dark": "oklch(100% calc(clamp(0, calc(0.16800000000000004 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(21.999999999999996% calc(clamp(0, calc(0.040000000000000036 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(60% calc(clamp(0, calc(0.32000000000000006 * var(--🧑-sat)), 0.4)) 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "alt": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "dark": "oklch(calc(clamp(0, calc(0.20000000000000007 - calc(pow(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "light": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		          "mid": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 210)",
		        },
		        "$root": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 210)",
		        "dark": "oklch(20.000000000000007% calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) 210)",
		        "light": "oklch(100% calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) 210)",
		        "mid": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 210)",
		      },
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "dark": "oklch(calc(clamp(0, calc(0.20000000000000007 - calc(pow(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "light": "oklch(calc(clamp(0, calc(1 - calc(pow(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		          "mid": "oklch(calc(clamp(0, calc(0.9 - calc(pow(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)), 1.7))), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) * var(--🧑-sat)) * 0.15), 0.4)) 90)",
		        },
		        "$root": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 90)",
		        "dark": "oklch(20.000000000000007% calc(clamp(0, calc(0.22000000000000003 * var(--🧑-sat)), 0.4)) 90)",
		        "light": "oklch(100% calc(clamp(0, calc(0.020000000000000018 * var(--🧑-sat)), 0.4)) 90)",
		        "mid": "oklch(90% calc(clamp(0, calc(0.30000000000000004 * var(--🧑-sat)), 0.4)) 90)",
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
		          "$root": "oklch(0.5556387300380706 0.012000000000000002 90)",
		          "dark": "oklch(0.9851654360090278 0.006300000000000001 90)",
		          "light": "oklch(0.21870654598684525 0.0015000000000000013 90)",
		          "mid": "oklch(0.5556387300380706 0.012000000000000002 90)",
		        },
		        "$root": "oklch(60% 0.16000000000000003 90)",
		        "dark": "oklch(100% 0.08400000000000002 90)",
		        "light": "oklch(21.999999999999996% 0.020000000000000018 90)",
		        "mid": "oklch(60% 0.16000000000000003 90)",
		      },
		    },
		    "isDark": true,
		  },
		  "light": {
		    "colors": {
		      "primary": {
		        "$neutral": {
		          "$root": "oklch(0.8602483517886919 0.011250000000000001 90)",
		          "dark": "oklch(0.17653786308766073 0.00825 90)",
		          "light": "oklch(0.9996018928294464 0.0007500000000000007 90)",
		          "mid": "oklch(0.8602483517886919 0.011250000000000001 90)",
		        },
		        "$root": "oklch(90% 0.15000000000000002 90)",
		        "dark": "oklch(20.000000000000007% 0.11000000000000001 90)",
		        "light": "oklch(100% 0.010000000000000009 90)",
		        "mid": "oklch(90% 0.15000000000000002 90)",
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
		`"oklch(49.83194021770374% calc(clamp(0, calc(0.24507745423571184 * var(--🧑-sat)), 0.4)) var(--my-hue))"`,
	);
});
