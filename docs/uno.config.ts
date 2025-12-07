import arbor from '@arbor-css/core/preset';
import { defineConfig } from 'unocss';

export default defineConfig({
	presets: [
		arbor({
			primaryHue: 130,
		}),
	],
	configDeps: ['../packages/core/src/**/*.ts', '../packages/core/dist/**/*.js'],
	content: {
		pipeline: {
			include: ['./src/**/*.{astro,html,js,ts}'],
		},
	},
});
