import { ModeValues } from '@arbor-css/modes';
import { PresetTokens } from '@arbor-css/preset';
import { BasicPresetModeSchema } from '../../basicPreset/preset.js';
import { ModeSchema } from '../schema/schema.js';

export type Tokens<TColorName extends string> = PresetTokens<
	ModeSchema<TColorName> & BasicPresetModeSchema,
	{}
>;
export type Values<TColorName extends string> = ModeValues<
	ModeSchema<TColorName> & BasicPresetModeSchema
>;
