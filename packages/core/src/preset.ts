import { Preset } from 'unocss';

export default function presetArbor(config: unknown): Preset {
	return {
		name: 'arbor',
		enforce: 'post',
	};
}
