import { presetArbor } from '../src/presets/arborPreset/index.js';

export const arbor = presetArbor({
	color: {
		ranges: {
			primary: {
				hue: 90.8,
			},
			alt: {
				hue: 210,
			},
			green: {
				hue: 150,
			},
		},
		mainColor: 'primary',
	},
	globals: {
		saturation: 0.5,
		baseFontSize: '16px',
		roundness: 0.5,
		baseSpacingSize: '8px',
	},
});

arbor.bundleMode('alt', {
	color: {
		main: arbor.$.mode.primitive.color.alt,
		neutral: arbor.$.mode.primitive.color.alt.$neutral,
	},
	control: {
		border: arbor.$.mode.primitive.color.alt.heavy.var,
		bg: arbor.$.mode.primitive.color.alt.wash.var,
	},
});

arbor.bundleMode('greenButtons', {
	action: {
		primary: {
			bg: arbor.$.mode.primitive.color.green.mid.var,
			fg: arbor.$.mode.primitive.color.green.ink.var,
			border: arbor.$.mode.primitive.color.green.heavy.var,
		},
		secondary: {
			bg: arbor.$.mode.primitive.color.green.light.var,
			fg: arbor.$.mode.primitive.color.green.heavy.var,
			border: arbor.$.mode.primitive.color.green.heavy.var,
		},
	},
});

arbor.bundleMode('dense', {
	global: {
		density: 2,
	},
});

export default arbor;
