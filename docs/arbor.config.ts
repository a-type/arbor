import { definePreset } from '@arbor-css/core';
import { presetArbor } from '@arbor-css/core/preset-arbor';

const basePreset = presetArbor({
	config: {
		globals: {
			saturation: 0.5,
		},
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
});

const preset = definePreset({
	name: 'arbor-docs',
	extends: [basePreset],
	modeSchema: {
		decoration: 'other',
	},
	baseMode: () => ({
		decoration: 'none',
	}),
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	preset.bundleMode(season, {
		color: {
			main: preset.$.primitives.color[season],
			neutral: preset.$.primitives.color[season].$neutral,
		},
	});
}

makeSeasonMode('winter');
makeSeasonMode('spring');
makeSeasonMode('summer');
makeSeasonMode('fall');

preset.bundleMode('structure', {
	decoration: 'url("/images/structure.svg")',
});
preset.bundleMode('creativity', {
	decoration: 'url("/images/creativity.svg")',
});

preset.bundleMode('hero', {
	density: 0.5,
	text: {
		primary: preset.$.primitives.typography['4xl'],
		secondary: preset.$.primitives.typography['2xl'],
		ambient: preset.$.primitives.typography.md,
	},
});

export default preset;
