import { $systemProps, createArborPreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import { getStructuredTokensMap } from './getStructuredTokensMap.js';

it('generates a map of mode, primitive, and system tokens with correct paths', () => {
	const preset = createArborPreset({
		colors: {
			ranges: {
				brand: {
					hue: 80,
				},
			},
			mainColor: 'brand',
		},
	});
	preset.primitives.colors.light.colors.brand.mid;
	const map = getStructuredTokensMap(preset);

	expect(map.has('color.main.mid')).toBe(true);
	expect(map.get('color.main.mid')).toBe(preset.$.mode.color.main.mid);
	expect(map.has('primitives.spacing.md')).toBe(true);
	expect(map.get('color.main')).toBe(preset.$.mode.color.main.$root);
	expect(map.has('primitives.spacing.md')).toBe(true);
	expect(map.get('primitives.spacing.md')).toBe(preset.$.primitives.spacing.md);
	expect(map.has('system.fg')).toBe(true);
	expect(map.get('system.fg')).toBe($systemProps.fg.$root);
});
