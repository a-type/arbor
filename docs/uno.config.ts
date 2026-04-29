import { presetArbor } from '@arbor-css/classes';
import { defineConfig, presetIcons } from 'unocss';
import { arbor } from './arbor.js';

export default defineConfig({
	presets: [
		presetIcons({
			collections: {
				md: () =>
					import('@iconify-json/material-symbols-light').then((m) => m.icons),
			},
		}),
		presetArbor(arbor),
	],
	configDeps: ['./arbor.ts'],
});
