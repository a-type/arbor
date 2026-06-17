import * as esbuild from 'esbuild';
import { cp } from 'node:fs/promises';
import * as path from 'node:path';

// copy wasm file to dist
await cp(
	path.join(
		import.meta.dirname,
		'./node_modules/lightningcss-wasm/lightningcss_node.wasm',
	),
	path.join(import.meta.dirname, './dist/lightningcss_node.wasm'),
	{ force: true },
);

const watch = process.argv.includes('--watch');

/** @type {esbuild.BuildOptions} */
const options = {
	entryPoints: ['src/extension.ts'],
	bundle: true,
	outfile: 'dist/extension.mjs',
	external: ['vscode', 'lightningcss'],
	platform: 'node',
	format: 'esm',
	banner: {
		js: 'const require = createRequire(import.meta.url);',
	},
	target: 'node22',
	sourcemap: true,
	minify: false,
};

if (watch) {
	const ctx = await esbuild.context(options);
	await ctx.watch();
	console.log('Watching for changes...');
} else {
	await esbuild.build(options);
	console.log('Build complete.');
}
