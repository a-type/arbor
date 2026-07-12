import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import {
	createPrefixValidationConfig,
	createTokenMap,
	findInvalidTokenMatches,
	formatInvalidTokenMatchMessage,
} from './tokenValidation.js';

function createTestPreset() {
	return definePreset({
		modeSchema: {
			space: {
				md: 'spacing',
			},
		},
		baseMode: () => ({
			space: {
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
				definition: (css, { parameters: [color] }) => css`
					color: ${color};
				`,
			}),
		}),
	});
}

it('returns structured near-miss suggestions for unknown tokens', () => {
	const preset = createTestPreset();
	const knownTokenName = preset.$.mode.space.md.name;
	const misspelledTokenName = knownTokenName.replace(/md$/, 'mdd');
	const matches = findInvalidTokenMatches({
		content: ['.card {', `  ${misspelledTokenName}: 1rem;`, '}'].join('\n'),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(matches).toHaveLength(1);
	expect(matches[0].suggestions).toContain(knownTokenName);
	expect(formatInvalidTokenMatchMessage(matches[0])).toContain('Did you mean:');
});

it('ignores external props declared in one or more @external-props comments', () => {
	const preset = createTestPreset();
	const matches = findInvalidTokenMatches({
		content: [
			'/* @external-props: --x-vendor-thing */',
			'/* @external-props: --x-plugin-token, --x-fn-third-party */',
			'.card {',
			'  --x-vendor-thing: 1rem;',
			'  --x-plugin-token: 2rem;',
			'  --x-fn-third-party: 3rem;',
			'}',
		].join('\n'),
		tokenMap: createTokenMap(preset),
		prefixConfig: createPrefixValidationConfig(preset.context.tokenPrefixes),
	});

	expect(matches).toEqual([]);
});
