// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [mdx()],
	base: import.meta.env.BASE_PATH || '/',
	trailingSlash: 'never',
	site: import.meta.env.SITE,
});
