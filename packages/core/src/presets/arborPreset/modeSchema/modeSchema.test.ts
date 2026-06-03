import { expect, it } from 'vitest';
import { createArborModeSchema } from './modeSchema.js';

it('adds input colors to schema color typings and shape', () => {
	const schema = createArborModeSchema({
		colorNames: ['red', 'blue', 'green'],
	});

	expect(schema.primitive.color.red.mid.purpose).toBe('color');
	expect(schema.primitive.color.red.$neutral.mid.purpose).toBe('color');
});
