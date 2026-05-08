import { createToken } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { derive } from './tracking.js';

const a = createToken('a', {});
const b = createToken('b', {});
const c = createToken('c', {});

it('tracks simple token values', () => {
	expect(derive`${a}`).toEqual({
		value: a.var,
		dependencies: [a],
		'@@TRACKED': true,
	});
});

it('interpolates tokens into other things', () => {
	expect(derive`calc(${a} + 1px)`).toEqual({
		value: `calc(${a.var} + 1px)`,
		dependencies: [a],
		'@@TRACKED': true,
	});
});

it('handles fallbacks', () => {
	expect(derive`${{ value: a, fallback: b }}`).toEqual({
		value: a.varFallback(b.var),
		dependencies: [a, b],
		'@@TRACKED': true,
	});
});

it('handles nested fallbacks', () => {
	expect(derive`${{ value: a, fallback: { value: b, fallback: c } }}`).toEqual({
		value: a.varFallback(b.varFallback(c.var)),
		dependencies: [a, b, c],
		'@@TRACKED': true,
	});
});
