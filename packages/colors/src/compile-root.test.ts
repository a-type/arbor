import { expect, it } from 'vitest';
import { compileColors } from './compile.js';

it('assigns color and neutral $root to mid when mid exists', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['dark', 'mid', 'light'],
			},
		},
		schemes: {},
	});

	expect(compiled.light.colors.primary.$root).toBe(compiled.light.colors.primary.mid);
	expect(compiled.light.colors.primary.$neutral.$root).toBe(
		compiled.light.colors.primary.$neutral.mid,
	);
});

it('assigns $root to midpoint when mid is absent', () => {
	const compiled = compileColors({
		ranges: {
			primary: {
				hue: 90,
				rangeNames: ['low', 'high'] as const,
			},
		},
		schemes: {},
	});

	expect(compiled.light.colors.primary.$root).toBe(compiled.light.colors.primary.high);
	expect(compiled.light.colors.primary.$neutral.$root).toBe(
		compiled.light.colors.primary.$neutral.high,
	);
});
