import { createArbor, definePreset } from '@arbor-css/core';

const preset = createArbor().preset({
	global: {
		saturation: 0.5,
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

const { primitives } = preset;

export const modeSchema = preset.modes.base.schema.extend({
	decoration: 'other',
});

const rootMode = modeSchema.createBase({
	...preset.modes.base.values,
	decoration: 'none',
});

function makeSeasonMode(season: 'winter' | 'spring' | 'summer' | 'fall') {
	return modeSchema.createPartial(season, {
		color: {
			main: preset.$.primitives.color[season],
			neutral: preset.$.primitives.color[season].$neutral,
		},
	});
}

const winterMode = makeSeasonMode('winter');
const springMode = makeSeasonMode('spring');
const summerMode = makeSeasonMode('summer');
const fallMode = makeSeasonMode('fall');

const structureMode = modeSchema.createPartial('structure', {
	decoration: 'url("/images/structure.svg")',
});
const creativityMode = modeSchema.createPartial('creativity', {
	decoration: 'url("/images/creativity.svg")',
});

const heroMode = modeSchema.createPartial('hero', {
	density: 0.5,
	text: {
		primary: preset.$.primitives.typography['4xl'],
		secondary: preset.$.primitives.typography['2xl'],
		ambient: preset.$.primitives.typography.md,
	},
});

export const arbor = definePreset({
	primitives,
	modes: {
		base: rootMode,
		winter: winterMode,
		spring: springMode,
		summer: summerMode,
		fall: fallMode,
		structure: structureMode,
		creativity: creativityMode,
		hero: heroMode,
	},
	systemProps: preset.$.system,
	meta: preset.meta,
});
