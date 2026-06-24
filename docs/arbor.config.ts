import { definePreset } from '@arbor-css/core';
import { presetArbor } from '@arbor-css/core/preset-arbor';

export const basePreset = presetArbor({
	color: {
		mainColor: 'summer',
		ranges: {
			winter: {
				hue: 250,
				saturation: 0.3,
			},
			spring: {
				hue: 340,
				saturation: 0.4,
			},
			summer: {
				hue: 158,
				saturation: 1,
			},
			autumn: {
				hue: 40,
				saturation: 0.4,
			},
			attention: {
				hue: 20,
			},
		},
	},
	typography: {
		maxFontSize: '10rem',
		minFontSize: '0.9rem',
		baseWeight: 400,
		fontSizeScaleExponentStep: 1.25,
		defaultFontSize: 'calc(round(clamp(12px, 12px + 0.5vw, 18px), 1px))',
		roundToPixel: true,
	},
	shadow: {
		globalSpread: '1.5',
		globalBlur: '0',
	},
	shape: {
		lineWidth: '1',
		roundness: '0.75',
	},
	spacing: {
		baseSize: 'calc(clamp(4px, 4px + 0.25vw, 10px))',
		roundToPixel: true,
	},
	keyframes: {
		fadeInUp: (css, $) => css`
			from {
				opacity: 0;
				transform: translateY(${$.mode.spacing.sm});
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		`,
	},
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'autumn') {
	basePreset.bundleMode(season, {
		color: {
			main: basePreset.$.mode.color.palette[season],
			neutral: basePreset.$.mode.color.palette[season].$neutral,
		},
	});
}

makeSeasonMode('winter');
makeSeasonMode('spring');
makeSeasonMode('summer');
makeSeasonMode('autumn');

basePreset.bundleMode('neutral', {
	color: {
		main: basePreset.$.mode.color.neutral,
	},
});

basePreset.bundleMode('attention', {
	color: {
		main: basePreset.$.mode.color.palette.attention,
	},
});

basePreset.bundleMode('hero', {
	global: {
		spacing: {
			density: 0.5,
		},
		typography: {
			size: 3,
			fontSizeScaleBase: 1.5,
		},
	},
	text: {
		primary: {
			font: '"Cormorant", serif',
		},
		secondary: {
			font: '"Cormorant", serif',
		},
		ambient: {
			font: '"Cormorant", serif',
		},
	},
});

basePreset.bundleMode('normal', {
	global: {
		spacing: {
			density: basePreset.baseMode.global?.spacing?.density,
		},
		typography: {
			size: basePreset.baseMode.global?.typography?.size,
			fontSizeScaleBase:
				basePreset.baseMode.global?.typography?.fontSizeScaleBase,
		},
	},
});

basePreset.bundleMode('dense', {
	global: {
		spacing: {
			density: 1.5,
		},
		typography: {
			size: 0.75,
		},
	},
});

basePreset.bundleMode('denser', {
	global: {
		spacing: {
			density: 2,
		},
		typography: {
			size: 0.5,
			minFontSize: '0.75rem',
		},
	},
});

basePreset.bundleMode('round', {
	global: {
		shape: {
			roundness: 1.5,
		},
	},
});

basePreset.bundleMode('square', {
	global: {
		shape: {
			roundness: 0,
		},
	},
});

basePreset.bundleMode('thick', {
	global: {
		shape: {
			lineWidth: 2,
		},
		typography: {
			boldness: 0.85,
		},
	},
});

basePreset.bundleMode('slow', {
	global: {
		duration: {
			slowness: 3,
		},
	},
});

basePreset.bundleMode('no-animation', {
	global: {
		duration: {
			base: 0,
			max: 0,
		},
	},
});

const preset = definePreset({
	name: 'arbor-docs',
	extends: [basePreset],
	modeSchema: {},
	baseMode: () => ({}),

	mixins: (create, $) => ({
		disabled: create('disabled', {
			definition: (css) => css`
				&:disabled {
					${basePreset.mixins.bgDesaturated.apply({ '--step': '2' })}
					${basePreset.mixins.fgLighter.apply({ '--step': 1 })}
				}
			`,
		}),
		hover: create('hover', {
			definition: (css) => css`
				&:hover {
					${basePreset.mixins.bgLighter.apply({ '--step': 1 })}
					${basePreset.$.mixins.ring
						.value}: ${basePreset.functions.ring.compute({
						'--size': '2px',
						'--color': basePreset.$.mode.color.main.heavy,
					})};
					cursor: pointer;
				}
			`,
		}),
		focus: create('focus', {
			definition: (css) => css`
				&:focus {
					outline: none;
				}

				&:focus-visible {
					${basePreset.mixins.bgLighter.apply({ '--step': 2 })}
					${basePreset.$.mixins.ring
						.value}: ${basePreset.functions.ring.compute({
						'--size': '3px',
						'--color': basePreset.$.mode.color.main.heavy,
						'--offset': '1px',
					})};
				}
			`,
		}),
		active: create('active', {
			definition: (css) => css`
				&:active {
					${basePreset.mixins.bgHeavier.apply({ '--step': 1 })}
					${basePreset.$.mixins.ring
						.value}: ${basePreset.functions.ring.compute({
						'--size': '1px',
						'--color': basePreset.$.mode.color.main.heavy,
					})};
				}
			`,
		}),
	}),
});

export default preset;
