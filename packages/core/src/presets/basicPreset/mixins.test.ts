import { expect, it } from 'vitest';
import { presetBasic } from './preset.js';

it('exposes built-in ref color mixins with contributed tokens', () => {
	expect(presetBasic.mixins.bg.name).toContain('bg');
	expect(presetBasic.mixins.fg.name).toContain('fg');
	expect(presetBasic.mixins.borderColor.name).toContain('borderColor');
	expect(presetBasic.mixins.bg.parameters).toEqual(['--color']);
	expect(presetBasic.mixins.fg.parameters).toEqual(['--color']);
	expect(presetBasic.$.mixins.bg.applied.description).toBeTruthy();
	expect(presetBasic.$.mixins.bg.ref.description).toBeTruthy();
	expect(presetBasic.$.mixins.bg.contrast).toBeDefined();
	expect(presetBasic.$.mixins.bg.contrast?.description).toBeTruthy();
});
