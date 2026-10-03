import { presetV1 } from '../src/presets/v1/index.js';

export const arbor = presetV1({
	color: {
		ranges: {
			primary: {
				hue: 90.8,
				hueShift: -10,
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
	space: {
		baseSize: '8px',
	},
	shadow: {
		globalBlur: 0,
		globalSpread: 1,
	},
});

arbor.bundleMode('alt', {
	tint: arbor.$.mode.color.alt,
	gray: arbor.$.mode.color.alt.gray,
	control: {
		b: {
			color: arbor.$.mode.color.alt.heavy.var,
		},
		bg: arbor.$.mode.color.alt.wash.var,
	},
});

arbor.bundleMode('greenButtons', {
	action: {
		primary: {
			bg: arbor.$.mode.color.green.mid.var,
			fg: arbor.$.mode.color.green.ink.var,
			b: {
				color: arbor.$.mode.color.green.heavy.var,
			},
		},
		secondary: {
			bg: arbor.$.mode.color.green.light.var,
			fg: arbor.$.mode.color.green.heavy.var,
			b: {
				color: arbor.$.mode.color.green.heavy.var,
			},
		},
	},
});

arbor.bundleMode('dense', {
	global: {
		space: {
			density: 2,
		},
	},
});

export default arbor;
