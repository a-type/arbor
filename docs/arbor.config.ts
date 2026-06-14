import { definePreset } from '@arbor-css/core';
import { presetArbor } from '@arbor-css/core/preset-arbor';

export const basePreset = presetArbor({
	globals: {
		saturation: 0.5,
		shadowSpread: 1.5,
		shadowBlur: 0,
		lineWidth: 1,
		roundness: 0.5,
		baseFontSize: 'calc(clamp(12px, 12px + 0.5vw, 18px))',
	},
	color: {
		mainColor: 'summer',
		ranges: {
			winter: {
				hue: 200,
				saturation: 0.3,
			},
			spring: {
				hue: 140,
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
		maxSize: '10rem',
		minSize: '0.9rem',
		baseWeight: 400,
		sizeExponentStep: 1.25,
	},
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'autumn') {
	basePreset.bundleMode(season, {
		color: {
			main: basePreset.$.mode.primitive.color[season],
			neutral: basePreset.$.mode.primitive.color[season].$neutral,
		},
	});
}

makeSeasonMode('winter');
makeSeasonMode('spring');
makeSeasonMode('summer');
makeSeasonMode('autumn');

basePreset.bundleMode('hero', {
	global: {
		density: 0.5,
	},
	text: {
		primary: {
			...basePreset.$.mode.primitive.typography['6xl'],
			font: '"Cormorant", serif',
		},
		secondary: {
			...basePreset.$.mode.primitive.typography['2xl'],
			font: '"Cormorant", serif',
		},
		ambient: {
			...basePreset.$.mode.primitive.typography.md,
			font: '"Cormorant", serif',
		},
	},
});

basePreset.bundleMode('normal', {
	global: {
		density: 1,
	},
});

basePreset.bundleMode('dense', {
	global: {
		density: 1.5,
	},
});

basePreset.bundleMode('denser', {
	global: {
		density: 2,
	},
});

basePreset.bundleMode('round', {
	global: {
		roundness: 1,
	},
});

basePreset.bundleMode('square', {
	global: {
		roundness: 0,
	},
});

basePreset.bundleMode('thick', {
	global: {
		lineWidth: 2,
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
					${basePreset.$.mixins.ring.value
						.name}: ${basePreset.functions.ring.compute({
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
					${basePreset.$.mixins.ring.value
						.name}: ${basePreset.functions.ring.compute({
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
					${basePreset.$.mixins.ring.value
						.name}: ${basePreset.functions.ring.compute({
						'--size': '1px',
						'--color': basePreset.$.mode.color.main.heavy,
					})};
				}
			`,
		}),
	}),
});

export default preset;
