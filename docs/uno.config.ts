import { presetArbor } from '@arbor-css/classes';
import { globSync } from 'node:fs';
import { defineConfig, presetIcons } from 'unocss';
import { arbor } from './arbor.js';

const deps = ['./arbor.ts', ...globSync('../packages/*/dist/**/*.{js,jsx}')];

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
			ul, ol {
				padding-left: 1.5em;
			}
			li {
				line-height: 1.5;
			}
			a {
				color: inherit;
				text-decoration: none;
			}
			img {
				display: block;
				max-width: 100%;
			}
			h1, h2, h3, h4, h5, h6, p {
				margin: 0;
			}
			`,
		},
	],
	configDeps: deps,
});
