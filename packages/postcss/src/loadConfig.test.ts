import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, expect, it } from 'vitest';
import { loadConfig } from './loadConfig.js';

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(
		tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
	);
});

it('loads a config from the current working directory', async () => {
	const rootDir = await mkdtemp(join(tmpdir(), 'arbor-plugin-load-config-'));
	tempDirs.push(rootDir);

	await writeFile(
		join(rootDir, 'arbor.config.ts'),
		'export default { source: "cwd" };',
	);

	const loaded = await loadConfig({ cwd: rootDir });

	expect(loaded?.configPath).toBe(join(rootDir, 'arbor.config.ts'));
	expect(loaded?.preset).toEqual({ source: 'cwd' });
});

it('does not search parent directories for a config file', async () => {
	const rootDir = await mkdtemp(join(tmpdir(), 'arbor-plugin-load-config-'));
	tempDirs.push(rootDir);

	const childDir = join(rootDir, 'nested', 'child');
	await mkdir(childDir, { recursive: true });
	await writeFile(
		join(rootDir, 'arbor.config.ts'),
		'export default { source: "parent" };',
	);

	const loaded = await loadConfig({ cwd: childDir });

	expect(loaded).toBeNull();
});

it('resolves configFile relative to the current working directory', async () => {
	const rootDir = await mkdtemp(join(tmpdir(), 'arbor-plugin-load-config-'));
	tempDirs.push(rootDir);

	const configDir = join(rootDir, 'config');
	await mkdir(configDir, { recursive: true });
	await writeFile(
		join(configDir, 'custom.config.ts'),
		'export default { source: "custom" };',
	);

	const loaded = await loadConfig({
		cwd: rootDir,
		configFile: 'config/custom.config.ts',
	});

	expect(loaded?.configPath).toBe(join(configDir, 'custom.config.ts'));
	expect(loaded?.preset).toEqual({ source: 'custom' });
});
