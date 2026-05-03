import { ArborConfig, generateStylesheet } from '@arbor-css/core';
import { Preset, presetWind4, transformerVariantGroup } from 'unocss';
import { rules } from './rules/index.js';
import { createTheme } from './theme/index.js';
import { variants } from './variants/index.js';

const basePreset = presetWind4({
	arbitraryVariants: true,
	variablePrefix: '🍂-',
	preflights: {
		theme: false,
	},
});

basePreset.rules = rules;

export function presetArbor(arbor: ArborConfig<any, any>): Preset {
	return {
		name: 'arbor',
		theme: createTheme(arbor),
		variants,
		presets: [basePreset],
		transformers: [transformerVariantGroup()],
		preflights: [
			{
				layer: 'base',
				getCSS: () => {
					return generateStylesheet(arbor);
				},
			},
		],
	};
}
