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

const mockLoadConfig = vi.mocked(loadConfigModule.loadConfig);

beforeEach(() => {
	mockLoadConfig.mockReset();
});

function makeConfigResult(preset: object) {
	return {
		configPath: '/fake/arbor.config.ts',
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
		definition: (css) => [
			{
				prop: '--_-system-shadow',
				value: css`
					${'0 0 0 0 transparent'}
				`,
			},
			{
				prop: '--_-system-ring',
				value: css`
					${'0 0 0 0 transparent'}
				`,
			},
			{
				prop: 'box-shadow',
				value: css`
					${'var(--_-system-ring), var(--_-system-shadow)'}
				`,
			},
		],
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
	expect(result.css).not.toContain('--fn-double(');
	expect(result.css).toContain('4');
});
