import { presetArbor } from '../src/presets/arborPreset/index.js';
import { contrastScheme } from './schemes.js';

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
		schemes: {
			contrast: contrastScheme,
		},
	},
	config: {
		globals: {
			saturation: 0.5,
			baseFontSize: '16px',
			roundness: 0.5,
			baseSpacingSize: '8px',
		},
	},
});

arbor.bundleMode('alt', {
	color: {
		main: arbor.$.primitives.color.alt,
		neutral: arbor.$.primitives.color.alt.$neutral,
	},
	control: {
		border: arbor.$.primitives.color.alt.heavy.var,
		bg: arbor.$.primitives.color.alt.wash.var,
	},
});

arbor.bundleMode('greenButtons', {
	action: {
		primary: {
			bg: arbor.$.primitives.color.green.mid.var,
			fg: arbor.$.primitives.color.green.ink.var,
			border: arbor.$.primitives.color.green.heavy.var,
		},
		secondary: {
			bg: arbor.$.primitives.color.green.light.var,
			fg: arbor.$.primitives.color.green.heavy.var,
			border: arbor.$.primitives.color.green.heavy.var,
		},
	},
});

arbor.bundleMode('dense', {
	density: 2,
});

export default arbor;
