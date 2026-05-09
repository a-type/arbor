import { createArborPreset } from '../src/index.js';
import { contrastScheme } from './schemes.js';

export const arbor = createArborPreset({
	colors: {
		ranges: {
			primary: {
				hue: 98,
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
	globals: {
		saturation: 0.5,
		baseFontSize: '16px',
		roundness: 0.5,
		baseSpacingSize: '8px',
	},
});

arbor.addMode('alt', {
	colors: {
		main: arbor.primitives.$tokens.colors.alt,
		neutral: arbor.primitives.$tokens.colors.alt.$neutral,
	},
	control: {
		border: arbor.primitives.$tokens.colors.alt.heavy.var,
		bg: arbor.primitives.$tokens.colors.alt.wash.var,
	},
});

arbor.addMode('greenButtons', {
	action: {
		primary: {
			bg: arbor.primitives.$tokens.colors.green.mid.var,
			fg: arbor.primitives.$tokens.colors.green.ink.var,
			border: arbor.primitives.$tokens.colors.green.heavy.var,
		},
		secondary: {
			bg: arbor.primitives.$tokens.colors.green.lighter.var,
			fg: arbor.primitives.$tokens.colors.green.heavier.var,
			border: arbor.primitives.$tokens.colors.green.heavy.var,
		},
	},
});

arbor.addMode('dense', {
	density: 2,
});

export default arbor;
