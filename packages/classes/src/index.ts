import { ArborConfig, generateStylesheet } from '@arbor-css/core';
import { Preset, transformerVariantGroup } from 'unocss';
import { rules } from './rules/index.js';
import { createTheme } from './theme/index.js';
import { Theme } from './theme/types.js';
import { variants } from './variants/index.js';

export function presetArbor(arbor: ArborConfig<any, any>): Preset<Theme> {
	return {
		name: 'arbor',
		rules,
		theme: createTheme(arbor),
		variants,
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
