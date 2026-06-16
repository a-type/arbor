import { createTokenFactory } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { css } from './interpolation.js';
import { resolveProperties } from './resolveProperties.js';

const createToken = createTokenFactory({ tokenPrefix: '--' });

it('replaces plain var values', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x);
			`,
			{ '--x': 'red' },
		),
	).toEqual(css`
		color: red;
	`);
});

it('replaces var values with fallbacks', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x, blue);
			`,
			{ '--x': 'red' },
		),
	).toEqual(css`
		color: red;
	`);
});

it('resolves properties which are CSS templates', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x);
			`,
			{ '--x': css`lighten(red, 10%)` },
		),
	).toEqual(css`
		color: lighten(red, 10%);
	`);
});

it('resolves nested property references', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x);
			`,
			{ '--x': 'var(--y)', '--y': 'red' },
		),
	).toEqual(css`
		color: red;
	`);
});

it('resolves nested property references with fallbacks', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x, blue);
			`,
			{
				'--x': 'var(--y, green)',
				'--y': 'red',
			},
		),
	).toEqual(css`
		color: red;
	`);
});

it('resolves nested property references within CSS templates', () => {
	const y = createToken('y');
	expect(
		resolveProperties(
			css`
				line-height: var(--x);
			`,
			{
				'--x': css`calc(${y} * 10%)`,
				[y.name]: '2',
			},
		),
	).toEqual(css`
		line-height: calc(2 * 10%);
	`);
	// y is resolved, so it should not be included in dependencies.
});

it('adds unresolved tokens within property references to dependencies', () => {
	const y = createToken('y');
	const result = resolveProperties(
		css`
			color: var(--x);
		`,
		{
			'--x': css`lighten(${y}, 10%)`,
		},
	);
	expect(result.tokens).toContain(y);
});

it('does not resolve cyclic token references', () => {
	expect(
		resolveProperties(
			css`
				color: var(--x);
			`,
			{
				'--x': 'var(--y)',
				'--y': 'var(--x)',
			},
		),
	).toEqual(css`
		color: var(--x);
	`);
});

it('handles var(..., ...) wrapped in other params', () => {
	expect(
		resolveProperties(css`calc(100% - var(--x, 20px))`, {
			'--x': '20px',
		}),
	).toEqual(css`calc(100% - 20px)`);
});

it('handles var(..., calc(...)) wrapped in other params', () => {
	expect(
		resolveProperties(css`calc(100% - var(--x, calc(20px - 1rem)))`, {
			'--x': '20px',
		}),
	).toEqual(css`calc(100% - 20px)`);
});

it('handles multiple complex token resolutions', () => {
	const primitiveSpacingSm = createToken('m-primitive-spacing-sm');
	const globalDensity = createToken('m-global-density');
	const baseSpacingSize = createToken('m-global-baseSpacingSize');
	const baseFontSize = createToken('m-global-baseFontSize');

	expect(
		resolveProperties(css`calc(${primitiveSpacingSm} / ${globalDensity})`, {
			[globalDensity.name]: css`calc(1 + 1)`,
			[primitiveSpacingSm.name]: css`calc((${baseSpacingSize} / ${baseFontSize}) * 1rem * pow(2, 1 * -1))`,
			[baseSpacingSize.name]: '8px',
			[baseFontSize.name]: '16px',
		}),
	).toEqual(
		css`calc(calc((8px / 16px) * 1rem * pow(2, 1 * -1)) / calc(1 + 1))`,
	);
});
