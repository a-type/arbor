import { presetArbor } from '@arbor-css/classes';
import { defineConfig, presetIcons, presetWind4 } from 'unocss';
import { arbor } from './arbor.js';

export default defineConfig({
	presets: [
		presetIcons({
			collections: {
				md: () =>
					import('@iconify-json/material-symbols-light').then((m) => m.icons),
			},
		}),
		presetWind4(),
		presetArbor(arbor),
	],
});
