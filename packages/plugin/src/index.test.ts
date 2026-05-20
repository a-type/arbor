import { mkdtemp, rm } from 'fs/promises';
import postcss from 'postcss';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { afterEach, expect, it } from 'vitest';
import { ArborPlugin } from './index.js';

const tempDirs: string[] = [];

afterEach(async () => {
	await Promise.all(
		tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
	);
});

it('expands the Arbor stylesheet import from a configured preset', async () => {
	const repoRoot = resolve(process.cwd(), '..', '..');
	const result = await postcss([
		ArborPlugin({
			cwd: repoRoot,
			configFile: 'playground/arbor.config.ts',
		}),
	]).process("@import 'arbor:css';", {
		from: join(repoRoot, 'playground', 'global.css'),
	});

	expect(result.css).not.toContain("arbor:css");
	expect(result.css).toContain('--x-color-main-paper');
	expect(result.messages).toContainEqual(
		expect.objectContaining({
			type: 'dependency',
			file: join(repoRoot, 'playground', 'arbor.config.ts'),
		}),
	);
});

it('rewrites color properties to Arbor system props', async () => {
	const repoRoot = resolve(process.cwd(), '..', '..');
	const result = await postcss([
		ArborPlugin({
			cwd: repoRoot,
			configFile: 'playground/arbor.config.ts',
		}),
	]).process('.button { background-color: red; color: white; }', {
		from: join(repoRoot, 'playground', 'button.css'),
	});

	expect(result.css).toContain('--x-system-bg-applied: red');
	expect(result.css).toContain('--x-system-bg: var(--x-system-bg-applied)');
	expect(result.css).toContain('--x-system-bg-opacity: 1');
	expect(result.css).toContain('--x-system-bg-contrast: var(--x-system-bg-applied)');
	expect(result.css).toContain('background-color: var(--x-system-bg)');
	expect(result.css).toContain('--x-system-fg-applied: white');
	expect(result.css).toContain('color: var(--x-system-fg)');
});

it('warns and leaves CSS untouched when no Arbor config is available', async () => {
	const cwd = await mkdtemp(join(tmpdir(), 'arbor-postcss-missing-config-'));
	tempDirs.push(cwd);

	const input = '.button { color: red; }';
	const result = await postcss([ArborPlugin({ cwd })]).process(input, {
		from: join(cwd, 'button.css'),
	});

	expect(result.css).toBe(input);
	expect(result.warnings()).toHaveLength(1);
	expect(result.warnings()[0]?.text).toContain('No arbor.config file found');
});
