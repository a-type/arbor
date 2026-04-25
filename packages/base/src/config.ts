import { DeepPartial, ModeOf, ModeSchemaLevel } from './modes/modeSchema';
import { Primitives } from './primitives/primitives';

export interface ArborConfig<ModeShape extends ModeSchemaLevel> {
	primitives: Primitives;
	modes: {
		base: ModeOf<ModeShape>;
		[key: string]: DeepPartial<ModeOf<ModeShape>>;
	};
}

export function createConfig<ModeShape extends ModeSchemaLevel>(
	config: ArborConfig<ModeShape>,
): ArborConfig<ModeShape> {
	return config;
}
