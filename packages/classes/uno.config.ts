import { globSync } from 'node:fs';
import { defineConfig } from 'unocss';
import arbor from './arbor.config.js';
import { presetArbor } from './src/index.js';

const deps = [
	'./src/arbor.config.ts',
	...globSync('./dist/**/*.{js,jsx}'),
	...globSync('../core/dist/**/*.{js,jsx}'),
	...globSync('../modes/dist/**/*.{js,jsx}'),
	...globSync('../colors/dist/**/*.{js,jsx}'),
];
export default defineConfig({
	presets: [presetArbor(arbor)],
	configDeps: [...deps],
});
