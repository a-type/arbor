import arbor from '@arbor-css/core/preset';
import { defineConfig } from 'unocss';

export default defineConfig({
	presets: [
		arbor({
			primaryHue: 158,
		}),
	],
	configDeps: ['../packages/core/src', '../packages/core/dist'],
	content: {
		pipeline: {
			include: ['./src/**/*.{astro,html,js,ts}'],
		},
	},
});
