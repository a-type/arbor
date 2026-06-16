import { createTokenFactory } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { css } from './interpolation.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

it('interpolates string and number values', () => {
	expect(css`
		width: ${10}px;
	`.text).toBe('width: 10px;');
	expect(css`
		content: '${'hello'}';
	`.text).toBe("content: 'hello';");
});

it('interpolates left-hand usage of token', () => {
	const token = createToken('color');
	const value = css`
		${token}: red;
	`;
	expect(value.text).toBe('--x-color: red;');
	expect(value.tokens).toEqual([]);
});

it('interpolates token values and tracks dependencies', () => {
	const token = createToken('color');
	const value = css`
		color: ${token};
	`;
	expect(value.text).toBe('color: var(--x-color);');
	expect(value.tokens).toEqual([token]);
});
