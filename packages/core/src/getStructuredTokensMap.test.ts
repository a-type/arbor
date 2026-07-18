import { tokenSchemaToList } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { getStructuredTokensMap } from './getStructuredTokensMap.js';
import { presetV1 } from './presets/v1/preset.js';

it('generates a map of mode and system tokens with correct paths', () => {
	const preset = presetV1({
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

	expect(map.has('tint.mid')).toBe(true);
	expect(map.get('tint.mid')).toBe(preset.$.mode.tint.mid);
	expect(map.has('sp.md')).toBe(true);
	expect(map.get('tint')).toBe(preset.$.mode.tint.$root);
	expect(map.has('sp.md')).toBe(true);
	expect(map.get('sp.md')).toBe(preset.$.mode.sp.md);
});

it('applies descriptions to all built-in system and global tokens', () => {
	const preset = presetV1({
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
