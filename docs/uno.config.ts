import arbor from '@arbor-css/core/preset';
import { defineConfig } from 'unocss';

export default defineConfig({
	presets: [
		arbor({
			primaryHue: 158,
			namedHues: {
				winter: {
					sourceHue: 200,
					saturation: 0.2,
				},
				spring: {
					sourceHue: 120,
					saturation: 0.7,
				},
				summer: {
					sourceHue: 158,
					saturation: 1,
				},
				fall: {
					sourceHue: 40,
					saturation: 0.8,
				},
			},
		}),
	],
	configDeps: ['../packages/core/src', '../packages/core/dist'],
	content: {
		pipeline: {
			include: ['./src/**/*.{astro,html,js,ts}'],
		},
	},
	preflights: [
		{
			getCSS() {
				return `* { transition: 0.2s ease-in-out all; }`;
			},
		},
	],
});
