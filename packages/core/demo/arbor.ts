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
		globalSaturation: 0.5,
	},
	typography: {
		weightStep: -100,
		maxWeight: 600,
		defaultFontSize: '16px',
		maxFontSize: '12rem',
		minFontSize: '0.5rem',
		fontSizeScaleExponentStep: 2,
	},
	shape: {
		roundness: 0.5,
	},
	spacing: {
		baseSize: '8px',
	},
});

arbor.bundleMode('alt', {
	color: {
		main: arbor.$.mode.color.palette.alt,
		neutral: arbor.$.mode.color.palette.alt.$neutral,
	},
	control: {
		border: arbor.$.mode.color.palette.alt.heavy.var,
		bg: arbor.$.mode.color.palette.alt.wash.var,
	},
});

arbor.bundleMode('greenButtons', {
	action: {
		primary: {
			bg: arbor.$.mode.color.palette.green.mid.var,
			fg: arbor.$.mode.color.palette.green.ink.var,
			border: arbor.$.mode.color.palette.green.heavy.var,
		},
		secondary: {
			bg: arbor.$.mode.color.palette.green.light.var,
			fg: arbor.$.mode.color.palette.green.heavy.var,
			border: arbor.$.mode.color.palette.green.heavy.var,
		},
	},
});

arbor.bundleMode('dense', {
	global: {
		spacing: {
			density: 2,
		},
	},
});

export default arbor;
