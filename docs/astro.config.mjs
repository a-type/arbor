// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Arbor CSS',
			logo: {
				src: './public/images/arbor-logo.svg',
			},
			customCss: ['./src/styles/docs.css'],
			components: {
				Head: './src/components/Head.astro',
			},
		}),
	],
	base: import.meta.env.BASE_PATH || '/',
	trailingSlash: 'never',
	site: import.meta.env.SITE,
});
