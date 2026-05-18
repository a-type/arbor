import { createArbor } from '../src/index.js';
import { contrastScheme } from './schemes.js';

export const arbor = createArbor().preset({
	colors: {
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
	globals: {
		saturation: 0.5,
		baseFontSize: '16px',
		roundness: 0.5,
		baseSpacingSize: '8px',
	},
})
	.withMode('alt', (preset) => ({
		colors: {
			main: preset.$.primitives.colors.alt,
			neutral: preset.$.primitives.colors.alt.$neutral,
		},
		control: {
			color: {
				border: preset.$.primitives.colors.alt.heavy.var,
				bg: preset.$.primitives.colors.alt.wash.var,
			},
		},
	}))
	.withMode('greenButtons', (preset) => ({
		action: {
			primary: {
				color: {
					bg: preset.$.primitives.colors.green.mid.var,
					fg: preset.$.primitives.colors.green.ink.var,
					border: preset.$.primitives.colors.green.heavy.var,
				},
			},
			secondary: {
				color: {
					bg: preset.$.primitives.colors.green.light.var,
					fg: preset.$.primitives.colors.green.heavy.var,
					border: preset.$.primitives.colors.green.heavy.var,
				},
			},
		},
	}))
	.withMode('dense', () => ({
		density: 2,
	}));

export default arbor;
