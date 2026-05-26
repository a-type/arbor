import { expect, it } from 'vitest';
import { createArbor } from './createArborPreset.js';

it('compiles', () => {
	const preset = createArbor().preset({
		color: {
			ranges: {
				primary: {
					hue: 30,
				},
			},
			mainColor: 'primary',
		},
	});

	expect(preset.primitives.color.light.colors.primary).toBeDefined();
});

it('supports custom prefixes per token type', () => {
	const preset = createArbor({
		modeTokenPrefix: '--acme-mode-',
		primitiveTokenPrefix: '--acme-primitive-',
		metaTokenPrefix: '--acme-meta-',
		functionNamePrefix: '--acme-fn-',
		mixinNamePrefix: '--acme-mx-',
		mixinTokenPrefix: '--acme-mx-',
	}).preset({
		color: {
			ranges: {
				primary: {
					hue: 30,
				},
			},
			mainColor: 'primary',
		},
	});

	expect(preset.meta?.tokenPrefixes.modeTokenPrefix).toBe('--acme-mode-');
	expect(preset.$.mode.color.main.$root.name.startsWith('--acme-mode-')).toBe(
		true,
	);
	expect(
		preset.$.primitives.spacing.$root.name.startsWith('--acme-primitive-'),
	).toBe(true);
	expect(preset.$.system.meta.modeName.name.startsWith('--acme-meta-')).toBe(
		true,
	);
	expect(preset.functions.lightenColor.name.startsWith('--acme-fn-')).toBe(
		true,
	);
	expect(preset.mixins.shadow.name.startsWith('--acme-mx-')).toBe(true);
	expect(preset.$.mixins.shadow.shadow.name.startsWith('--acme-mx-')).toBe(
		true,
	);
});
