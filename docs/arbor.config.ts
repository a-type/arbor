import { css, definePreset } from '@arbor-css/core';
import { presetArbor } from '@arbor-css/core/preset-arbor';

const basePreset = presetArbor({
	globals: {
		saturation: 0.5,
		shadowSpread: 1.5,
		shadowBlur: 0,
		lineWidth: 1,
		roundness: 0,
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
			fall: {
				hue: 40,
				saturation: 0.4,
			},
			attention: {
				hue: 0,
			},
		},
	},
	typography: {
		sizeExponentStep: 1.25,
		maxSize: '10rem',
	},
});

const preset = definePreset({
	name: 'arbor-docs',
	extends: [basePreset],
	modeSchema: {
		dynamic: {
			gridGap: 'spacing',
		},
	},
	baseMode: ($) => ({
		dynamic: {
			gridGap: css`calc(${$.mode.global.roundness} * ${$.mode.spacing.md})`,
		},
	}),
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	preset.bundleMode(season, {
		color: {
			main: preset.$.mode.primitive.color[season],
			neutral: preset.$.mode.primitive.color[season].$neutral,
		},
	});
}

makeSeasonMode('winter');
makeSeasonMode('spring');
makeSeasonMode('summer');
makeSeasonMode('fall');

preset.bundleMode('hero', {
	global: {
		density: 0.5,
	},
	text: {
		primary: preset.$.mode.primitive.typography['4xl'],
		secondary: preset.$.mode.primitive.typography['2xl'],
		ambient: preset.$.mode.primitive.typography.md,
	},
});

preset.bundleMode('dense', {
	global: {
		density: 1.5,
	},
});

preset.bundleMode('round', {
	global: {
		roundness: 1,
	},
});

export default preset;
