// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import chokidar from 'chokidar';
import UnoCSS from 'unocss/astro';

/**
 * @returns {import('vite').Plugin}
 */
const pluginWatchElsewhere = () => {
	let timeout;
	/** @type {import('chokidar').FSWatcher} */
	let watcher;
	return {
		name: 'watch-elsewhere',
		configureServer(server) {
			watcher = chokidar.watch(['../packages/core/dist'], {
				ignoreInitial: true,
				depth: 99,
			});
			console.log('Watching core package for changes...');
			function debouncedRestart() {
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					console.log('Changes detected in core package, reloading...');
					server.restart();
				}, 300);
			}
			watcher.on('all', () => {
				debouncedRestart();
			});
		},
		closeBundle() {
			console.log('Closing...');
			watcher.close();
		},
	};
};

// https://astro.build/config
export default defineConfig({
	integrations: [UnoCSS(), mdx()],
	vite: {
		plugins: [pluginWatchElsewhere()],
	},
});
