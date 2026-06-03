import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import {
	createPrefixValidationConfig,
	createTokenMap,
	validateCssContent,
} from './validate.js';

function createTestPreset() {
	const preset = definePreset({
		modeSchema: {
			spacing: {
				md: 'spacing',
			},
		},
		baseMode: () => ({
			spacing: {
				md: '16px',
			},
		}),
		name: 'test-preset',
		config: {
			modeTokenPrefix: '--x-',
			metaTokenPrefix: '--x_-',
			functionNamePrefix: '--x-fn-',
			mixinNamePrefix: '--x-mx-',
			mixinTokenPrefix: '--x-mx-',
		},

		functions: (create) => ({
			double: create('double', {
				parameters: ['--value'] as const,
				definition: ($, value) => $`${value}`,
			}),
		}),

		mixins: (create) => ({
			fg: create('fg', {
				parameters: ['--color'] as const,
				definition: ($, { parameters: [color] }) => ({
					color: $`${color}`,
				}),
			}),
		}),
	});

	return preset;
}

it('reports unknown declarations, functions, and mixins for configured prefixes', () => {
	const preset = createTestPreset();
	const issues = validateCssContent({
		content: [
			'.card {',
			'  --x-does-not-exist: 1px;',
			'  width: --x-fn-missing(1);',
			'  @apply --x-mx-missing;',
			'}',
		].join('\n'),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(issues).toHaveLength(3);
	expect(issues.map((issue) => issue.message)).toEqual(
		expect.arrayContaining([
			expect.stringContaining('Unknown Arbor token: --x-does-not-exist'),
			'Unknown Arbor function: --x-fn-missing',
			'Unknown Arbor mixin: --x-mx-missing',
		]),
	);
});

it('suggests similar Arbor tokens for unknown declarations', () => {
	const preset = createTestPreset();
	const knownTokenName = preset.$.mode.spacing.md.name;
	const misspelledTokenName = knownTokenName.replace(/md$/, 'mdd');
	const issues = validateCssContent({
		content: ['.card {', `  ${misspelledTokenName}: 1rem;`, '}'].join('\n'),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(issues).toHaveLength(1);
	expect(issues[0].message).toContain(
		`Unknown Arbor token: ${misspelledTokenName}`,
	);
	expect(issues[0].message).toContain('Did you mean:');
	expect(issues[0].message).toContain(knownTokenName);
});

it('reports misuse when functions or mixins are used as declarations', () => {
	const preset = createTestPreset();
	const issues = validateCssContent({
		content: ['.card {', '  --x-fn-double: 1;', '  --x-mx-fg: red;', '}'].join(
			'\n',
		),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(issues).toHaveLength(2);
	expect(issues.map((issue) => issue.message)).toEqual(
		expect.arrayContaining([
			'Arbor functions cannot be used as property declarations: --x-fn-double',
			'Arbor mixins cannot be used as property declarations: --x-mx-fg',
		]),
	);
});

it('accepts existing declarations, function calls, and mixin apply usage', () => {
	const preset = createTestPreset();
	const knownTokenName = preset.$.mode.spacing.md.name;
	const issues = validateCssContent({
		content: [
			'.card {',
			`  ${knownTokenName}: 1rem;`,
			'  width: --x-fn-double(1);',
			'  @apply --x-mx-fg(red);',
			'}',
		].join('\n'),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(issues).toEqual([]);
});
