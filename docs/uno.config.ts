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
	preflights: [
		{
			getCSS: () => `
			body {
				font-family: system-ui, sans-serif;
				padding: 0;
				margin: 0;
			}
			html {
				padding: 0;
				margin: 0;
			}
			* {
				box-sizing: border-box;
			}
		`,
		},
	],
	configDeps: ['./arbor.ts', '../packages/classes/src'],
});
