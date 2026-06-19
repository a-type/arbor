import { tokenSchemaToList } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { getStructuredTokensMap } from './getStructuredTokensMap.js';
import { presetArbor } from './presets/arborPreset/preset.js';

it('generates a map of mode, primitive, and system tokens with correct paths', () => {
	const preset = presetArbor({
		color: {
			ranges: {
				brand: {
					hue: 80,
				},
			},
			mainColor: 'brand',
		},
	});
	const map = getStructuredTokensMap(preset);

	expect(map.has('color.main.mid')).toBe(true);
	expect(map.get('color.main.mid')).toBe(preset.$.mode.color.main.mid);
	expect(map.has('primitive.spacing.md')).toBe(true);
	expect(map.get('color.main')).toBe(preset.$.mode.color.main.$root);
	expect(map.has('primitive.spacing.md')).toBe(true);
	expect(map.get('primitive.spacing.md')).toBe(
		preset.$.mode.primitive.spacing.md,
	);
});

it('applies descriptions to all built-in system and global tokens', () => {
	const preset = presetArbor({
		color: {
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
	expect(
		preset.$.mode.global.typography.baseFontSize.description,
	).toBeDefined();
});
