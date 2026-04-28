import { ArborConfig, generateStylesheet } from '@arbor-css/core';
import { Preset } from 'unocss';

export function presetArbor(arbor: ArborConfig<any, any>): Preset {
	return {
		name: 'arbor',
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
