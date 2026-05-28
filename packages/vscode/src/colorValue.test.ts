import { flattenTokenSchema } from '@arbor-css/core';
import { presetArbor } from '@arbor-css/core/preset-arbor';
import { expect, it } from 'vitest';
import { parseCssColor } from './colorValue.js';
import {
	resolveColorTokenValueByName,
	resolveTokenValue,
} from './resolvedTokenValue.js';
import type { ConfigState, TokenMap } from './tokenProvider.js';

function expectColor(
	value: ReturnType<typeof parseCssColor>,
	expected: { red: number; green: number; blue: number; alpha: number },
) {
	expect(value).not.toBeNull();
	expect(value?.red).toBeCloseTo(expected.red);
	expect(value?.green).toBeCloseTo(expected.green);
	expect(value?.blue).toBeCloseTo(expected.blue);
	expect(value?.alpha).toBeCloseTo(expected.alpha);
}

function createTestState(): ConfigState {
	const preset = presetArbor({
		color: {
			mainColor: 'red',
			ranges: {
				red: {
					hue: 0,
				},
			},
		},
	});

	const tokenMap: TokenMap = new Map(
		flattenTokenSchema(preset.$).map((token) => [token.name, token]),
	);

	return {
		configPath: 'test',
		preset,
		tokenMap,
		tokenPrefixes: ['--m-'],
	};
}

it('parses hex, rgb, and hsl colors into normalized rgba channels', () => {
	expectColor(parseCssColor('#ff000080'), {
		red: 1,
		green: 0,
		blue: 0,
		alpha: 128 / 255,
	});
	expectColor(parseCssColor('rgb(0 255 0 / 50%)'), {
		red: 0,
		green: 1,
		blue: 0,
		alpha: 0.5,
	});
	expectColor(parseCssColor('hsl(240 100% 50% / 0.25)'), {
		red: 0,
		green: 0,
		blue: 1,
		alpha: 0.25,
	});
});

it('parses oklch colors into rgba channels', () => {
	expectColor(parseCssColor('oklch(100% 0 0 / 50%)'), {
		red: 1,
		green: 1,
		blue: 1,
		alpha: 0.5,
	});
	expectColor(parseCssColor('oklch(0% 0 0)'), {
		red: 0,
		green: 0,
		blue: 0,
		alpha: 1,
	});
});

it('resolves Arbor color tokens through the shared helper', () => {
	const state = createTestState();
	const colorToken = (state.preset.$.mode.color as any).main.$root;
	const spacingToken = state.preset.$.primitives.spacing.$root;

	expect(resolveTokenValue(state, colorToken)).toBe(
		'oklch(90% 0.15000000000000002 0)',
	);
	expect(resolveColorTokenValueByName(state, colorToken.name)).toBe(
		'oklch(90% 0.15000000000000002 0)',
	);
	expect(resolveColorTokenValueByName(state, spacingToken.name)).toBeNull();
});

it('ignores unsupported color syntaxes', () => {
	expect(parseCssColor('color-mix(in hsl, red, white)')).toBeNull();
	expect(parseCssColor('oklch(from red l c h / 50%)')).toBeNull();
});
