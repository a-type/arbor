import presetWind4 from '@unocss/preset-wind4';
import { Preset } from 'unocss';
import { AllPreflightOptions, preflights } from './preflights';
import { rules } from './rules';
import { makeTheme } from './theme';

const modifiedWind4 = presetWind4({
	arbitraryVariants: true,
	variablePrefix: 'ar-',
	preflights: {
		theme: false,
	},
});

modifiedWind4.rules = rules;

export interface ArborConfig extends AllPreflightOptions {}

export default function presetArbor(config: ArborConfig): Preset {
	modifiedWind4.theme = makeTheme(config);

	return {
		name: 'arbor',
		enforce: 'post',
		presets: [modifiedWind4],
		preflights: preflights(config),
	};
}
