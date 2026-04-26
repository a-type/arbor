import { PrimitiveGlobals } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors } from './compile';
import { createColorRange, defaultRangeNames } from './ranges';

it('compiles a set of color ranges with default schemes and no precalculated globals', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				sourceHue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
			alt: {
				sourceHue: 210,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "dark": {
		    "alt": {
		      "dark": "oklch(100% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "light": "oklch(23.210136348723754% calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "mid": "oklch(68.55975649671599% calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "light": "oklch(calc(clamp(0, calc(0.23194085666980135 - pow(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "mid": "oklch(calc(clamp(0, calc(0.6831695771423242 - pow(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		      },
		    },
		    "primary": {
		      "dark": "oklch(100% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "light": "oklch(23.210136348723754% calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "mid": "oklch(68.55975649671599% calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "light": "oklch(calc(clamp(0, calc(0.23194085666980135 - pow(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "mid": "oklch(calc(clamp(0, calc(0.6831695771423242 - pow(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		      },
		    },
		  },
		  "light": {
		    "alt": {
		      "dark": "oklch(0% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "light": "oklch(100% calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		      },
		    },
		    "primary": {
		      "dark": "oklch(0% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "light": "oklch(100% calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		      },
		    },
		  },
		}
	`);
});

it('compiles a set of color ranges with a custom scheme', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				sourceHue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
			alt: {
				sourceHue: 210,
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
			},
		},
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "custom": {
		    "alt": {
		      "dark": "oklch(0% 0 210)",
		      "light": "oklch(0% 0 210)",
		      "mid": "oklch(0% 0 210)",
		      "neutral": {
		        "dark": "oklch(0.001 0 210)",
		        "light": "oklch(0.001 0 210)",
		        "mid": "oklch(0.001 0 210)",
		      },
		    },
		    "primary": {
		      "dark": "oklch(0% 0 90)",
		      "light": "oklch(0% 0 90)",
		      "mid": "oklch(0% 0 90)",
		      "neutral": {
		        "dark": "oklch(0.001 0 90)",
		        "light": "oklch(0.001 0 90)",
		        "mid": "oklch(0.001 0 90)",
		      },
		    },
		  },
		  "dark": {
		    "alt": {
		      "dark": "oklch(100% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "light": "oklch(23.210136348723754% calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "mid": "oklch(68.55975649671599% calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "light": "oklch(calc(clamp(0, calc(0.23194085666980135 - pow(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "mid": "oklch(calc(clamp(0, calc(0.6831695771423242 - pow(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		      },
		    },
		    "primary": {
		      "dark": "oklch(100% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "light": "oklch(23.210136348723754% calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "mid": "oklch(68.55975649671599% calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "light": "oklch(calc(clamp(0, calc(0.23194085666980135 - pow(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.11744519599791439 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "mid": "oklch(calc(clamp(0, calc(0.6831695771423242 - pow(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.29880093415200876 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		      },
		    },
		  },
		  "light": {
		    "alt": {
		      "dark": "oklch(0% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "light": "oklch(100% calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) 210)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		        "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 210)",
		      },
		    },
		    "primary": {
		      "dark": "oklch(0% calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "light": "oklch(100% calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "mid": "oklch(76.66666666666666% calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) 90)",
		      "neutral": {
		        "dark": "oklch(calc(clamp(0, calc(0.001 - pow(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.08435767717846043 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "light": "oklch(calc(clamp(0, calc(0.996 - pow(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.1636750818142668 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		        "mid": "oklch(calc(clamp(0, calc(0.7638333333333333 - pow(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)), 1.6)), 1)) calc(clamp(0, calc(calc(calc(clamp(0, calc(0.2938079893899562 * var(--🎨-🧑-sat)), 0.4)) * var(--🎨-🧑-sat)) * 0.15), 0.4)) 90)",
		      },
		    },
		  },
		}
	`);
});

it('precomputes colors when globals are provided', () => {
	const globals: PrimitiveGlobals = {
		saturation: 0.5,
		roundness: 0.5,
	};
	const compiled = compileColors({
		ranges: {
			primary: {
				sourceHue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {},
		globals,
	});

	expect(compiled).toMatchInlineSnapshot(`
		{
		  "dark": {
		    "primary": {
		      "dark": "oklch(100% 0.042178838589230216 90)",
		      "light": "oklch(23.210136348723754% 0.058722597998957196 90)",
		      "mid": "oklch(68.55975649671599% 0.14940046707600438 90)",
		      "neutral": {
		        "dark": "oklch(0.9896882267663254 0.0031634128941922662 90)",
		        "light": "oklch(0.22122348188583338 0.004404194849921789 90)",
		        "mid": "oklch(0.6354207038310236 0.011205035030700328 90)",
		      },
		    },
		  },
		  "light": {
		    "primary": {
		      "dark": "oklch(0% 0.042178838589230216 90)",
		      "light": "oklch(100% 0.0818375409071334 90)",
		      "mid": "oklch(76.66666666666666% 0.1469039946949781 90)",
		      "neutral": {
		        "dark": "oklch(0 0.0031634128941922662 90)",
		        "light": "oklch(0.9777726256287377 0.006137815568035005 90)",
		        "mid": "oklch(0.7173546551204665 0.011017799602123358 90)",
		      },
		    },
		  },
		}
	`);
});

it('provides default range names', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				sourceHue: 90,
			},
		},
		schemes: {},
	});

	for (const name of defaultRangeNames) {
		expect(compiled.dark.primary).toHaveProperty(name);
	}
});
