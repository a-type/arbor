import { createMixinFactory } from '@arbor-css/functions';
import { createTokenFactory } from '@arbor-css/tokens';
import postcss from 'postcss';
import { beforeEach, expect, it, vi } from 'vitest';
import { createFunctionFactory } from '../../functions/dist/functions.js';
import { ArborPlugin } from './index.js';
import * as loadConfigModule from './loadConfig.js';

// Mock loadConfig so tests don't need jiti file I/O
vi.mock('./loadConfig.js', () => ({
	loadConfig: vi.fn(),
}));

// Mock fs/promises so we can control stat results
vi.mock('node:fs/promises', () => ({
	stat: vi.fn(),
}));

import * as fspModule from 'node:fs/promises';

const mockLoadConfig = vi.mocked(loadConfigModule.loadConfig);
const mockStat = vi.mocked(fspModule.stat);

beforeEach(() => {
	mockLoadConfig.mockReset();
	mockStat.mockReset();
	// Default: stat fails (virtual/fake path — skip mtime caching)
	mockStat.mockRejectedValue(new Error('ENOENT'));
});

function makeConfigResult(preset: object) {
	return {
		configPath: '/fake/arbor.config.ts',
		dependencies: ['/fake/arbor.config.ts'],
		preset: {
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			...preset,
		},
	} as any;
}

it('inlines @apply for an Arbor mixin', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const shadow = createMixin('shadow', {
		description: 'Stacked shadow setup',
		definition: (css) => css`
			--_-system-shadow: 0 0 0 0 transparent;
			--_-system-ring: 0 0 0 0 transparent;
			box-shadow: var(--_-system-ring), var(--_-system-shadow);
		`,
	});

	// Fake stat so cache check passes
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { shadow }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-shadow; color: red; }`,
		{ from: undefined },
	);

	const output = result.css;
	expect(output).toContain('--_-system-shadow: 0 0 0 0 transparent');
	expect(output).toContain('--_-system-ring: 0 0 0 0 transparent');
	expect(output).toContain(
		'box-shadow: var(--_-system-ring), var(--_-system-shadow)',
	);
	expect(output).not.toContain('@apply');
});

it('warns when @apply references an unknown mixin', async () => {
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: {},
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-unknown; }`,
		{ from: undefined },
	);

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('--mx-unknown'))).toBe(true);
	// The unresolved @apply should remain in the output
	expect(result.css).toContain('@apply --mx-unknown');
});

it('warns when mixin parameters are incorrect', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });

	const fg = createMixin('fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => css`
			color: ${color};
		`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { fg }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(`.btn { @apply --mx-fg; }`, {
		from: undefined,
	});

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('Missing required parameter'))).toBe(
		true,
	);
	// The unresolved @apply should remain in the output
	expect(result.css).toContain('@apply --mx-fg');
});

it('does not touch @apply rules without the Arbor mixin prefix', async () => {
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: {},
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply some-tailwind-class; }`,
		{ from: undefined },
	);

	expect(result.css).toContain('@apply some-tailwind-class');
});

it('inlines function calls in declaration values', async () => {
	const createFunction = createFunctionFactory({ namePrefix: '--fn-' });
	const double = createFunction('double', {
		description: 'Doubles a number',
		parameters: ['--value'],
		definition: ($, value) => $`${value}`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: { double },
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { font-size: --fn-double(4); }`,
		{ from: undefined },
	);

	// The function call should be replaced with the computed value
	expect(result.css).toContain('font-size: 4');
});

it('warns when a function call references an unknown function', async () => {
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: {},
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { font-size: --fn-unknown(4); }`,
		{ from: undefined },
	);

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('--fn-unknown'))).toBe(true);
	// The unresolved function call should remain in the output
	expect(result.css).toContain('--fn-unknown(4)');
});

it('warns when a function call has incorrect parameters', async () => {
	const createFunction = createFunctionFactory({ namePrefix: '--fn-' });
	const double = createFunction('double', {
		description: 'Doubles a number',
		parameters: ['--value'],
		definition: ($, value) => $`${value}`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: { double },
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { font-size: --fn-double(); }`,
		{ from: undefined },
	);

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('Missing required parameter'))).toBe(
		true,
	);
	// The unresolved function call should remain in the output
	expect(result.css).toContain('--fn-double()');
});

it('inlines function calls passed as parameters to other functions', async () => {
	const createFunction = createFunctionFactory({ namePrefix: '--fn-' });
	const double = createFunction('double', {
		description: 'Doubles a number',
		parameters: ['--value'],
		definition: ($, value) => $`${value}`,
	});

	const triple = createFunction('triple', {
		description: 'Triples a number',
		parameters: ['--value'],
		definition: ($, value) => $`${value}`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: { double, triple },
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { font-size: --fn-double(--fn-triple(2)); }`,
		{ from: undefined },
	);

	expect(result.css).toContain('font-size: 2');
});

it('handles complex multi-line function params', async () => {
	const createFunction = createFunctionFactory({ namePrefix: '--fn-' });
	const darken = createFunction('darken', {
		description: 'Doubles a number',
		parameters: ['--color', '--amount'],
		definition: ($, color, amount) => $`${color} ${amount}`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			context: {
				tokenPrefixes: {
					modeTokenPrefix: '--m-',
					primitiveTokenPrefix: '--p-',
					metaTokenPrefix: '--_-',
					refTokenPrefix: '--ref-',
					functionNamePrefix: '--fn-',
					mixinNamePrefix: '--mx-',
					mixinTokenPrefix: '--mx-',
				},
			},
			functions: { darken },
			mixins: {},
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn {
			background: --fn-darken(
				color-mix(var(--a), var(--b) 10%),
				2
			);
		}`,
		{ from: undefined },
	);

	expect(result.css).toContain(
		'background: color-mix(var(--a), var(--b) 10%) 2',
	);
});

it('inlines @apply mixin arguments into parameterized mixin declarations', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const fg = createMixin('fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => css`
			color: ${color};
		`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { fg }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-fg(var(--m-color-main-ink)); }`,
		{ from: undefined },
	);

	expect(result.css).toContain('color: var(--m-color-main-ink)');
	expect(result.css).not.toContain('var(--color)');
	expect(result.css).not.toContain('@apply');
});

it('inlines function results passed as @apply mixin arguments', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const createFunction = createFunctionFactory({ namePrefix: '--fn-' });

	const fade = createFunction('fade', {
		description: 'Writes alpha onto a color',
		parameters: ['--color', '--opacity'] as const,
		definition: (css, color, opacity) =>
			css`oklch(from ${color} l c h / ${opacity})`,
	});

	const fg = createMixin('fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => css`
			color: ${color};
		`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: { fade }, mixins: { fg }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-fg(--fn-fade(var(--m-color-main-ink), 42%)); }`,
		{ from: undefined },
	);

	expect(result.css).toContain(
		'color: oklch(from var(--m-color-main-ink) l c h / 42%)',
	);
	expect(result.css).not.toContain('@apply');
});

it('warns when @apply omits a required mixin argument', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const fg = createMixin('fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => css`
			color: ${color};
		`,
	});
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { fg }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(`.btn { @apply --mx-fg; }`, {
		from: undefined,
	});

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('Missing required parameter'))).toBe(
		true,
	);
	expect(result.css).toContain('@apply --mx-fg');
});

it('inlines scoped mixin declarations under at-rules', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const responsiveBg = createMixin('responsive-bg', {
		definition: (css) => css`
			@media (max-width: 400px) {
				background: red;
			}
		`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({
			functions: {},
			mixins: { responsiveBg },
			$: undefined,
		}),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-responsive-bg; }`,
		{
			from: undefined,
		},
	);

	expect(result.css).toContain('@media (max-width: 400px)');
	expect(result.css).toContain('background: red');
	expect(result.css).not.toContain('@apply --mx-responsive-bg');
});

it('inlines scoped mixin declarations from list syntax with parameter values', async () => {
	const createToken = createTokenFactory({ tokenPrefix: '--mx-' });
	const createMixin = createMixinFactory({ namePrefix: '--mx-', createToken });
	const responsiveFg = createMixin('responsive-fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => css`
			color: ${color};
			@media (max-width: 400px) {
				color: ${color};
			}
		`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { responsiveFg }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --mx-responsive-fg(var(--m-color-main-ink)); }`,
		{ from: undefined },
	);

	expect(result.css).toContain('color: var(--m-color-main-ink)');
	expect(result.css).toContain('@media (max-width: 400px)');
	expect(result.css).not.toContain('var(--color)');
	expect(result.css).not.toContain('@apply');
});

it('evicts the cache when the config file size changes even if mtime is the same (sub-second write)', async () => {
	// Simulate a file whose mtime stays the same across two reads (1-second
	// filesystem granularity) but whose size changes because content was rewritten.
	const FAKE_PATH = '/fake/arbor.config.ts';
	const FIXED_MTIME = 1_700_000_000_000;

	const firstPreset = makeConfigResult({
		functions: {},
		mixins: {},
		$: undefined,
	});
	const secondPreset = makeConfigResult({
		functions: {},
		mixins: {},
		$: undefined,
	});

	mockLoadConfig
		.mockResolvedValueOnce({ ...firstPreset, configPath: FAKE_PATH })
		.mockResolvedValueOnce({ ...secondPreset, configPath: FAKE_PATH });

	// stat sequence:
	//  1. After initial loadConfig: store mtime=fixed, size=100
	//  2. Declaration handler cache-check during first run: same mtime+size → cache hit
	//  3. Once handler cache-check at start of second run: same mtime, size=200 → evict
	//  4. After second loadConfig: store mtime=fixed, size=200
	//  5. Declaration handler cache-check during second run: same mtime+size → cache hit
	mockStat
		.mockResolvedValueOnce({ mtimeMs: FIXED_MTIME, size: 100 } as any) // store after 1st load
		.mockResolvedValueOnce({ mtimeMs: FIXED_MTIME, size: 100 } as any) // cache-check in 1st run
		.mockResolvedValueOnce({ mtimeMs: FIXED_MTIME, size: 200 } as any) // cache-check in 2nd run → evict
		.mockResolvedValueOnce({ mtimeMs: FIXED_MTIME, size: 200 } as any) // store after 2nd load
		.mockResolvedValueOnce({ mtimeMs: FIXED_MTIME, size: 200 } as any); // cache-check in 2nd run decl

	const plugin = ArborPlugin({ cwd: '/fake' });

	// First run — loads and caches the config
	await postcss([plugin]).process(`.a { color: red; }`, { from: undefined });
	expect(mockLoadConfig).toHaveBeenCalledTimes(1);

	// Second run — mtime is identical but size differs; cache must be evicted
	await postcss([plugin]).process(`.a { color: red; }`, { from: undefined });
	expect(mockLoadConfig).toHaveBeenCalledTimes(2);
});

it('does not reload config when both mtime and size are unchanged', async () => {
	const FAKE_PATH = '/fake/arbor.config.ts';
	const FIXED_MTIME = 1_700_000_000_000;

	const preset = makeConfigResult({ functions: {}, mixins: {}, $: undefined });
	mockLoadConfig.mockResolvedValue({ ...preset, configPath: FAKE_PATH });

	// stat always returns the same mtime and size
	mockStat.mockResolvedValue({ mtimeMs: FIXED_MTIME, size: 512 } as any);

	const plugin = ArborPlugin({ cwd: '/fake' });

	await postcss([plugin]).process(`.a { color: red; }`, { from: undefined });
	await postcss([plugin]).process(`.a { color: red; }`, { from: undefined });
	await postcss([plugin]).process(`.a { color: red; }`, { from: undefined });

	// loadConfig should only be called once; subsequent runs hit the cache
	expect(mockLoadConfig).toHaveBeenCalledTimes(1);
});
