import { ModeValues } from '@arbor-css/modes';
import { PresetTokens } from '@arbor-css/preset';
import {
	BasicPresetModeSchema,
	presetBasic,
} from '../../basicPreset/preset.js';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';

export type Tokens<TColorName extends string> = PresetTokens<
	ArborModeSchema<TColorName> & BasicPresetModeSchema,
	{},
	[typeof presetBasic]
>;
export type Values<TColorName extends string> = ModeValues<
	ArborModeSchema<TColorName> & BasicPresetModeSchema
>;

type Test = Values<'default'>['primitive']['color']['default'];
