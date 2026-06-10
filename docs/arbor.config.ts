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
		maxSize: '10rem',
		baseWeight: 300,
		weightStep: 100,
		sizeExponentStep: 1.25,
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

	mixins: (create, $) => ({
		disabled: create('disabled', {
			definition: (css) => [
				...basePreset.mixins.bgDesaturate.apply(['50%', undefined]),
				...basePreset.mixins.fgLighten.apply([1, undefined]),
			],
		}),
	}),
});

preset.$.mixins.bgFade;
preset.$.mixins.disabled;
// @ts-expect-error
preset.$.mixins.aksdjfkds;

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
		primary: {
			...preset.$.mode.primitive.typography['6xl'],
			font: '"Cormorant", serif',
		},
		secondary: {
			...preset.$.mode.primitive.typography['2xl'],
			font: '"Cormorant", serif',
		},
		ambient: {
			...preset.$.mode.primitive.typography.md,
			font: '"Cormorant", serif',
		},
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
