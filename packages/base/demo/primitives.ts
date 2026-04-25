import { createPrimitives } from '../src/primitives/primitives';
import { contrastScheme } from './schemes';

export const primitives = createPrimitives({
	namedHues: { primary: 90, alt: 210, green: 150 },
	globals: {
		saturation: 0.5,
	},
	schemes: {
		contrast: contrastScheme,
	},
});
