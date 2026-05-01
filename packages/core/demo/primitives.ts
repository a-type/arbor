import { createPrimitives } from '../src/index.js';
import { colors } from './colors.js';
import { contrastScheme } from './schemes.js';

export const primitives = createPrimitives({
	colors,
	globals: {
		saturation: 0.5,
	},
	defaultScheme: 'light',
	schemeTags: {
		contrast: contrastScheme.tag,
	},
});

primitives.colors.contrast.primary.heavier;
primitives.$tokens.colors.primary.heavier;
