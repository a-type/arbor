import { createGlobalContext } from '@arbor-css/globals';
import { expect, it } from 'vitest';
import { compileColors } from './compile.js';

const ctx = createGlobalContext();

it('assigns color and neutral $root to mid when mid exists', () => {
	const compiled = compileColors(
		{
			ranges: {
				primary: {
					hue: 90,
					rangeNames: ['heavy', 'mid', 'light'],
				},
			},
		},
		ctx,
	);

	expect(compiled.primary.$root).toBe(compiled.primary.mid);
	expect(compiled.primary.$neutral.$root).toBe(compiled.primary.$neutral.mid);
});

it('assigns $root to midpoint when mid is absent', () => {
	const compiled = compileColors(
		{
			ranges: {
				primary: {
					hue: 90,
					rangeNames: ['low', 'high'] as const,
				},
			},
		},
		ctx,
	);

	expect(compiled.primary.$root).toBe(compiled.primary.high);
	expect(compiled.primary.$neutral.$root).toBe(compiled.primary.$neutral.high);
});
