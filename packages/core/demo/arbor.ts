import { createArborPreset } from '../src/index.js';
import { contrastScheme } from './schemes.js';

export const arbor = createArborPreset({
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
			main: preset.primitives.$tokens.colors.alt,
			neutral: preset.primitives.$tokens.colors.alt.$neutral,
		},
		control: {
			color: {
				border: preset.primitives.$tokens.colors.alt.heavy.var,
				bg: preset.primitives.$tokens.colors.alt.wash.var,
			},
		},
	}))
	.withMode('greenButtons', (preset) => ({
		action: {
			primary: {
				color: {
					bg: preset.primitives.$tokens.colors.green.mid.var,
					fg: preset.primitives.$tokens.colors.green.ink.var,
					border: preset.primitives.$tokens.colors.green.heavy.var,
				},
			},
			secondary: {
				color: {
					bg: preset.primitives.$tokens.colors.green.light.var,
					fg: preset.primitives.$tokens.colors.green.heavy.var,
					border: preset.primitives.$tokens.colors.green.heavy.var,
				},
			},
		},
	}))
	.withMode('dense', () => ({
		density: 2,
	}));

export default arbor;
