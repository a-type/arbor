import { createFunctionFactory } from '@arbor-css/functions';
import { createMixinFactory } from '@arbor-css/mixins';
import postcss from 'postcss';
import { beforeEach, expect, it, vi } from 'vitest';
import { ArborPlugin } from './index.js';
import * as loadConfigModule from './loadConfig.js';

// Mock loadConfig so tests don't need jiti file I/O
vi.mock('./loadConfig.js', () => ({
	loadConfig: vi.fn(),
}));

const mockLoadConfig = vi.mocked(loadConfigModule.loadConfig);

beforeEach(() => {
	mockLoadConfig.mockReset();
});

function makeConfigResult(preset: object) {
	return {
		configPath: '/fake/arbor.config.ts',
		preset,
	} as any;
}

it('inlines @apply for an Arbor mixin', async () => {
	const createMixin = createMixinFactory({ tokenPrefix: '--x-' });
	const shadow = createMixin('shadow', {
		description: 'Stacked shadow setup',
		definition: (css) => [
			{ prop: '--x-system-shadow', value: css`${'0 0 0 0 transparent'}` },
			{ prop: '--x-system-ring', value: css`${'0 0 0 0 transparent'}` },
			{
				prop: 'box-shadow',
				value: css`${'var(--x-system-ring), var(--x-system-shadow)'}`,
			},
		],
	});

	// Fake stat so cache check passes
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: { shadow }, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --x-mixin-shadow; color: red; }`,
		{ from: undefined },
	);

	const output = result.css;
	expect(output).toContain('--x-system-shadow: 0 0 0 0 transparent');
	expect(output).toContain('--x-system-ring: 0 0 0 0 transparent');
	expect(output).toContain(
		'box-shadow: var(--x-system-ring), var(--x-system-shadow)',
	);
	expect(output).not.toContain('@apply');
});

it('warns when @apply references an unknown mixin', async () => {
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: {}, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply --x-mixin-unknown; }`,
		{ from: undefined },
	);

	const warnings = result.messages
		.filter((m) => m.type === 'warning')
		.map((m) => (m as any).text as string);

	expect(warnings.some((w) => w.includes('--x-mixin-unknown'))).toBe(true);
	// The unresolved @apply should remain in the output
	expect(result.css).toContain('@apply --x-mixin-unknown');
});

it('does not touch @apply rules without the Arbor mixin prefix', async () => {
	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: {}, mixins: {}, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { @apply some-tailwind-class; }`,
		{ from: undefined },
	);

	expect(result.css).toContain('@apply some-tailwind-class');
});

it('inlines function calls in declaration values', async () => {
	const createFunction = createFunctionFactory({ tokenPrefix: '--x-' });
	const double = createFunction('double', {
		description: 'Doubles a number',
		parameters: ['--value'],
		definition: ($, value) => $`${value}`,
	});

	mockLoadConfig.mockResolvedValue(
		makeConfigResult({ functions: { double }, mixins: {}, $: undefined }),
	);

	const plugin = ArborPlugin({ cwd: '/fake' });
	const result = await postcss([plugin]).process(
		`.btn { font-size: --x-fn-double(4); }`,
		{ from: undefined },
	);

	// The function call should be replaced with the computed value
	expect(result.css).not.toContain('--x-fn-double(');
	expect(result.css).toContain('4');
});
