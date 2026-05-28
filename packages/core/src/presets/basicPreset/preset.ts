import { definePreset } from '@arbor-css/preset';
import { createPresetFunctions } from './functions.js';
import { createPresetMixins } from './mixins.js';

/**
 * This basic preset includes utility mixins and functions,
 * but no primitive tokens or mode schema.
 */
export const presetBasic = definePreset({
	name: 'arbor-base',
	modeSchema: {},
	mixins: (create, $) => createPresetMixins($.system, create),
	functions: (create, $) => createPresetFunctions($.system, create),
});
