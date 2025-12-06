// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import chokidar from 'chokidar';
import UnoCSS from 'unocss/astro';

/**
 * @type {import('vite').Plugin}
 */
const pluginWatchElsewhere = {
	name: 'watch-elsewhere',
	configureServer(server) {
		const watcher = chokidar.watch(['../packages/core/dist'], {
			ignoreInitial: true,
			depth: 99,
		});
		console.log('Watching core package for changes...');
		let timeout;
		function debouncedRestart() {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				console.log('Changes detected in core package, reloading...');
				server.restart();
			}, 100);
		}
		watcher.on('all', () => {
			debouncedRestart();
		});
	},
};

// https://astro.build/config
export default defineConfig({
	integrations: [UnoCSS(), mdx()],
	vite: {
		plugins: [pluginWatchElsewhere],
	},
});
