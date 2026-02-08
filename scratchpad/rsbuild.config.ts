import { pluginUnoCss } from '@a-type/rsbuild-plugin-unocss';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const unoStats = {
	invalidations: 0,
	rebuilds: 0,
	deliveries: 0,
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [
		pluginUnoCss({
			events: {
				onCssGenerated: () => {
					unoStats.rebuilds++;
				},
				onCssInvalidated: () => {
					unoStats.invalidations++;
				},
				onCssResolved: () => {
					unoStats.deliveries++;
					console.log(`UnoCSS plugin stats:`);
					console.log(`  Invalidations: ${unoStats.invalidations}`);
					console.log(`  Rebuilds: ${unoStats.rebuilds}`);
					console.log(`  Deliveries: ${unoStats.deliveries}`);
				},
			},
		}),
		pluginReact(),
	],
	resolve: {
		alias: {
			'@': './src',
		},
	},
	tools: {
		rspack: {
			optimization: {
				realContentHash: true,
			},
			cache: false,
		},
	},
	server: {
		port: 5100,
	},
	source: {
		entry: {
			index: './src/index.tsx',
		},
	},
	dev: {
		client: {
			host: 'localhost',
		},
		progressBar: true,
	},
}));
