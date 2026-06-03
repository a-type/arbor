import { ModeValues } from '@arbor-css/modes';
import { PresetTokens } from '@arbor-css/preset';
import { presetBasic } from '../../basicPreset/preset.js';
import { ArborModeSchema } from '../modeSchema/modeSchema.js';

export type Tokens<TColorName extends string> = PresetTokens<
	ArborModeSchema<TColorName>,
	{},
	[typeof presetBasic]
>;
export type Values<TColorName extends string> = ModeValues<
	ArborModeSchema<TColorName>
>;

type Test = Values<'default'>['primitive']['color']['default'];
