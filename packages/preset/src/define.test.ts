import { compileColors } from '@arbor-css/colors';
import { createGlobalContext } from '@arbor-css/globals';
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
		}),
		baseMode: () => ({
			color: 'red',
		}),
		primitives: () => ({
			duration: {
				long: '300ms',
				short: '150ms',
				medium: '200ms',
			},
			spacing: {
				levels: {
					$root: '16px',
					lg: '32px',
					md: '16px',
				},
				defaultLevel: 'md',
			},
		}),
	});

	expect(preset.$.mode.color.name).toBe('--m-color');
	expect(preset.$.primitives.duration.long.name).toBe('--p-duration-long');
	expect(preset.$.primitives.spacing.lg.name).toBe('--p-spacing-lg');
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
		primitives: () => ({
			duration: {
				long: '300ms',
				short: '150ms',
				medium: '200ms',
			},
			spacing: {
				levels: {
					$root: '16px',
					lg: '32px',
					md: '16px',
				},
				defaultLevel: 'md',
			},
		}),
		mixins: (create, $) => ({
			test: create('test', {
				definition: (css) => ({
					transition: css`all ${$.primitives.duration.short}`,
				}),
				contributeTokens: {
					foo: 'other',
				},
			}),
		}),
		functions: (create, $) => ({
			test: create('test', {
				parameters: [],
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
		'@mixin --mx2-test { transition: all var(--p-duration-short); }',
	);
	expect(preset.functions.test).toBeDefined();
	// @ts-expect-error
	expect(preset.functions.bar).not.toBeDefined();

	expect(preset.$.mixins.test.foo.name).toBe('--mx2-test-foo');
});

it('composes presets', () => {
	const basePreset = definePreset({
		name: 'base-preset',
		modeSchema: {
			color: 'color',
		},
		baseMode: () => ({
			color: 'red',
			// TODO: prevent arbitrary keys.
			foo: 'bar',
		}),
		primitives: () => ({
			color: compileColors({
				context: createGlobalContext({}),
				ranges: {
					primary: {
						hue: 90,
					},
				},
			}),
			duration: {
				long: '300ms',
				short: '150ms',
				medium: '200ms',
			},
			spacing: {
				levels: {
					$root: '16px',
					lg: '32px',
					md: '16px',
				},
				defaultLevel: 'md',
			},
		}),
	});

	const extendedPreset = definePreset({
		name: 'extended-preset',
		modeSchema: {
			size: 'size',
		},
		baseMode: () => ({
			size: '16px',
		}),
		primitives: () => ({
			spacing: {
				levels: {
					$root: '16px',
					sm: '8px',
				},
				defaultLevel: 'md',
			},
		}),
		extends: [basePreset],
	});

	expect(extendedPreset.$.mode.color.name).toBe('--m-color');
	expect(extendedPreset.$.mode.size.name).toBe('--m-size');

	extendedPreset.modeSchema;

	// @ts-expect-error - mode extension does not fail to arbitrary shapes
	extendedPreset.$.mode.foo;

	expect(extendedPreset.$.primitives.color.primary.$root.name).toBe(
		'--p-color-primary',
	);
	expect(extendedPreset.$.primitives.spacing.sm.name).toBe('--p-spacing-sm');
	expect(extendedPreset.$.primitives.spacing.lg.name).toBe('--p-spacing-lg');
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
		primitives: () => ({
			color: compileColors({
				context: createGlobalContext({}),
				ranges: {
					primary: {
						hue: 90,
					},
				},
			}),
			duration: {
				long: '300ms',
				short: '150ms',
				medium: '200ms',
			},
			spacing: {
				levels: {
					$root: '16px',
					lg: '32px',
					md: '16px',
				},
				defaultLevel: 'md',
			},
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
		primitives: () => ({
			spacing: {
				levels: {
					$root: '16px',
					sm: '8px',
				},
				defaultLevel: 'md',
			},
		}),
		extends: [basePreset],
	});

	const withConfigPreset = extendedPreset.withConfig({
		modeTokenPrefix: '--custom-',
		primitiveTokenPrefix: '--pppp-',
	});

	expect(withConfigPreset.$.mode.color.name).toBe('--custom-color');
	expect(withConfigPreset.$.mode.size.name).toBe('--custom-size');
	expect(withConfigPreset.$.primitives.color.primary.$root.name).toBe(
		'--pppp-color-primary',
	);
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
		primitives: () => ({
			duration: {
				long: '300ms',
				short: '150ms',
				medium: '200ms',
			},
			spacing: {
				levels: {
					$root: '16px',
					lg: '32px',
					md: '16px',
				},
				defaultLevel: 'md',
			},
		}),
	});

	expect(preset.baseMode.color).toBe('red');

	preset.bundleMode('blue', {
		color: 'blue',
	});

	expect(getInternals(preset).modes[0].color).toBe('blue');

	const freeMode = preset.createMode('free', {
		color: 'green',
	});

	expect(freeMode.color).toBe('green');
	expect(getInternals(preset).modes[1]).not.toBeDefined();
});
