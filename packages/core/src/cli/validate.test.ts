import { createArbor } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import {
	createPrefixValidationConfig,
	createTokenMap,
	validateCssContent,
} from './validate.js';

function createTestPreset() {
	const builder = createArbor({
		modeTokenPrefix: '--x-',
		primitiveTokenPrefix: '--xp-',
		metaTokenPrefix: '--x_-',
		refTokenPrefix: '--xref-',
		functionNamePrefix: '--x-fn-',
		mixinNamePrefix: '--x-mx-',
		mixinTokenPrefix: '--x-mx-',
	});

	const double = builder.context.createFunction('double', {
		parameters: ['--value'] as const,
		definition: ($, value) => $`${value}`,
	});

	const fg = builder.context.createMixin('fg', {
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color] }) => ({
			color: css`${color}`,
		}),
	});

	return builder.preset({
		color: {
			mainColor: 'brand',
			ranges: {
				brand: {
					hue: 120,
				},
			},
		},
		functions: { double },
		mixins: { fg },
	});
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
			'Unknown Arbor token: --x-does-not-exist',
			'Unknown Arbor function: --x-fn-missing',
			'Unknown Arbor mixin: --x-mx-missing',
		]),
	);
});

it('reports misuse when functions or mixins are used as declarations', () => {
	const preset = createTestPreset();
	const issues = validateCssContent({
		content: [
			'.card {',
			'  --x-fn-double: 1;',
			'  --x-mx-fg: red;',
			'}',
		].join('\n'),
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
