import { globSync } from 'node:fs';
import { defineConfig } from 'unocss';
import arbor from './arbor.config.js';
import { presetArbor } from './src/index.js';

const deps = [
	'./src/arbor.config.ts',
	...globSync('./src/**/*.{ts,tsx}'),
	...globSync('../core/src/**/*.{ts,tsx}'),
	...globSync('../modes/src/**/*.{ts,tsx}'),
	...globSync('../colors/src/**/*.{ts,tsx}'),
];
export default defineConfig({
	presets: [presetArbor(arbor)],
	configDeps: [...deps],
});
