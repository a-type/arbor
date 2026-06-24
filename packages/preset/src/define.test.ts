import { createModeSchema } from '@arbor-css/modes';
import { expect, it } from 'vitest';
import { definePreset, getInternals } from './define.js';

it('defines a simple preset', () => {
	const preset = definePreset({
		name: 'test-preset',
		config: {
			functionNamePrefix: 'foo',
		},
		modeSchema: createModeSchema({
			color: 'color',
			spacing: {
				$root: 'size',
				sm: 'size',
				lg: 'size',
			},
		}),
		baseMode: () => ({
			color: 'red',
			spacing: {
				$root: '16px',
				sm: '8px',
				lg: '32px',
			},
		}),
	});

	expect(preset.$.mode.color.name).toBe('--m-color');
	expect(preset.$.mode.space.$root.name).toBe('--m-space');
});

it('allows defining functions or mixins using available tokens', () => {
	const preset = definePreset({
		name: 'test-preset',
		config: {
			functionNamePrefix: '--fn-',
			mixinNamePrefix: '--mx2-',
			mixinTokenPrefix: '--mx2-',
		},
		modeSchema: createModeSchema({
			color: 'color',
		}),
		baseMode: () => ({
			color: 'red',
		}),
		mixins: (create, $) => ({
			test: create('test', {
				parameters: ['--a'] as const,
				definition: (css) => css`
					color: ${$.mode.color};
				`,
				contributeTokens: {
					foo: 'other',
				},
			}),
		}),
		functions: (create, $) => ({
			test: create('test', {
				parameters: ['--a'] as const,
				definition: (css) => css`
					${$.mode.color}
				`,
			}),
			'use-foo': create('use-foo', {
				parameters: [],
				definition: (css) => css`
					${$.mixins.test.foo}
				`,
			}),
		}),
	});

	expect(preset.mixins.test).toBeDefined();
	// @ts-expect-error
	expect(preset.mixins.bar).not.toBeDefined();
	expect(preset.mixins.test.definition).toBe(
		'@mixin --mx2-test(--_-param-test-a) { color: var(--m-color); }',
	);
	expect(preset.functions.test).toBeDefined();
	// @ts-expect-error
	expect(preset.functions.bar).not.toBeDefined();

	expect(preset.$.mixins.test.foo.name).toBe('--mx2-test-foo');

	// mixin params are correctly typed
	preset.mixins.test.apply({ '--a': 'value' });
	// @ts-expect-error
	preset.mixins.test.apply({});
	preset.functions.test.compute({ '--a': 'value' });
	// @ts-expect-error
	preset.functions.test.compute({});
});

it('keeps mixin token inference narrowed when baseMode uses $ tokens', () => {
	const preset = definePreset({
		name: 'type-inference-base-mode',
		modeSchema: createModeSchema({
			color: 'color',
		}),
		baseMode: ($) => ({
			color: $.mode.color.varFallback('red'),
		}),
		mixins: (create) => ({
			bg: create('bg', {
				definition: (css) => css`
					background-color: transparent;
				`,
				contributeTokens: {
					contrast: 'color',
				},
			}),
		}),
		functions: (create, $) => ({
			'bg-contrast': create('bg-contrast', {
				parameters: [] as const,
				definition: (css) => css`
					${$.mixins.bg.contrast.var}
				`,
			}),
		}),
	});

	preset.$.mixins.bg.contrast.var;
	// @ts-expect-error - missing mixin key should be rejected
	preset.$.mixins.notReal;
});

it('composes presets', () => {
	const basePreset = definePreset({
		name: 'base-preset',
		modeSchema: {
			color: 'color',
		},
		globalCss: () => `/* base preset global css */`,
		baseMode: () => ({
			color: 'red',
			// TODO: prevent arbitrary keys.
			foo: 'bar',
		}),
		mixins: (create) => ({
			demo: create('demo', {
				parameters: [],
				definition: (css, { tokens }) => css`
					color: ${tokens.inputColor};
				`,
				contributeTokens: {
					inputColor: 'color',
				},
			}),
		}),
		functions: (create) => ({
			demo: create('demo', {
				parameters: [],
				definition: (css) => css`red`,
			}),
		}),
	});
	basePreset.bundleMode('blue', {
		color: 'blue',
	});

	const extendedPreset = definePreset({
		name: 'extended-preset',
		modeSchema: {
			size: 'size',
		},
		baseMode: () => ({
			size: '16px',
		}),
		extends: [basePreset],
		mixins: (create, $) => ({
			usesDemo: create('uses-demo', {
				parameters: [],
				definition: (css) => css`
					color: ${$.mixins.demo.inputColor};
				`,
				contributeTokens: {
					inputColor2: 'color',
				},
			}),
		}),
		functions: (create, $) => ({
			another: create('another', {
				parameters: [],
				definition: (css) => css`
					${$.mixins.demo.inputColor}
				`,
			}),
		}),
	});

	extendedPreset.bundleMode('green', {
		color: 'green',
		size: '32px',
	});

	expect(extendedPreset.$.mode.color.name).toBe('--m-color');
	expect(extendedPreset.$.mode.size.name).toBe('--m-size');

	expect(extendedPreset.$.mixins.demo).toBeDefined();
	expect(extendedPreset.mixins.usesDemo).toBeDefined();
	expect(extendedPreset.$.mixins.usesDemo.inputColor2.name).toBe(
		'--mx-uses-demo-inputColor2',
	);

	const internals = getInternals(extendedPreset);
	expect(internals.modes.blue).toBeDefined();
	expect(internals.modes.green).toBeDefined();

	expect(extendedPreset.globalCss).toContain('base preset global css');

	// typing checks
	extendedPreset.modeSchema;
	extendedPreset.mixins.demo;
	// @ts-expect-error
	extendedPreset.mixins.aslkdfjalsdkfj;
	// @ts-expect-error - mode extension does not fail to arbitrary shapes
	extendedPreset.$.mode.foo;
	extendedPreset.$.mixins.demo.inputColor.name;
	extendedPreset.functions.demo;
	extendedPreset.functions.another;
});

it('preserves base preset typings when composing without extension', () => {
	const basePreset = definePreset({
		name: 'base-preset',
		modeSchema: {
			color: 'color',
		},
		baseMode: () => ({
			color: 'red',
		}),
		mixins: (create) => ({
			demo: create('demo', {
				parameters: [],
				definition: (css) => css`
					color: red;
				`,
				contributeTokens: {
					inputColor: 'color',
				},
			}),
		}),
		functions: (create) => ({
			demo: create('demo', {
				parameters: [],
				definition: (css) => css`red`,
			}),
			baseOnly: create('baseOnly', {
				parameters: [],
				definition: (css) => css`red`,
			}),
		}),
	});

	const extendedPreset = definePreset({
		name: 'extended-preset',
		modeSchema: {},
		baseMode: () => ({}),
		extends: [basePreset],
	});

	extendedPreset.$.mode.color.name;
	extendedPreset.$.mixins.demo.inputColor.name;
	extendedPreset.functions.baseOnly;
	// @ts-expect-error
	extendedPreset.functions.asdf;
	// @ts-expect-error
	extendedPreset.mixins.alkjsdf;
});

it('allows changing global config on all extended presets', () => {
	const basePreset = definePreset({
		name: 'base-preset',
		modeSchema: createModeSchema({
			color: 'color',
		}),
		baseMode: () => ({
			color: 'red',
		}),
	});

	const extendedPreset = definePreset({
		name: 'extended-preset',
		modeSchema: createModeSchema({
			size: 'size',
		}),
		baseMode: () => ({
			size: '16px',
			color: 'blue',
			foo: 'bar',
		}),
		extends: [basePreset],
	});

	const withConfigPreset = extendedPreset.withConfig({
		modeTokenPrefix: '--custom-',
	});

	expect(withConfigPreset.$.mode.color.name).toBe('--custom-color');
	expect(withConfigPreset.$.mode.size.name).toBe('--custom-size');
});

it('allows creating modes from the final mode schema', () => {
	const preset = definePreset({
		name: 'test-preset',
		config: {
			functionNamePrefix: 'foo',
		},
		modeSchema: createModeSchema({
			color: 'color',
		}),
		baseMode: () => ({
			color: 'red',
		}),
	});

	expect(preset.baseMode.color).toBe('red');

	preset.bundleMode('blue', {
		color: 'blue',
	});

	expect(getInternals(preset).modes.blue.color).toBe('blue');

	const freeMode = preset.createMode('free', {
		color: 'green',
	});

	expect(freeMode.color).toBe('green');
	expect(getInternals(preset).modes.green).not.toBeDefined();
});
