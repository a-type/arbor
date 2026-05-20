import { createArbor } from '@arbor-css/preset';
import { tokenSchemaToList } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { getStructuredTokensMap } from './getStructuredTokensMap.js';

it('generates a map of mode, primitive, and system tokens with correct paths', () => {
	const preset = createArbor().preset({
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
	expect(map.get('system.fg')).toBe(preset.$.system.fg.$root);
});

it('applies descriptions to all built-in system and global tokens', () => {
	const preset = createArbor().preset({
		colors: {
			ranges: {
				brand: {
					hue: 80,
				},
			},
			mainColor: 'brand',
		},
	});
	const tokens = tokenSchemaToList(preset.$.system);

	expect(
		tokens.every(
			(token) =>
				typeof token.description === 'string' && token.description.length > 0,
		),
	).toBe(true);
	expect(preset.$.system.globals.baseFontSize.description).toBe(
		'Defines the root font size used to derive Arbor typography tokens.',
	);
	expect(preset.$.system.bg.$root.description).toBe(
		'Stores the final background color value Arbor applies in CSS.',
	);
});
