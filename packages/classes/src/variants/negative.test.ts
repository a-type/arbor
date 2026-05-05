import { expect, it } from 'vitest';
import { variantNegative } from './negative.js';

it('negates numeric declaration values', () => {
	const result = variantNegative.match('-m-2');
	expect(result).toBeTruthy();
	expect(result).not.toBeTypeOf('string');

	if (!result || typeof result === 'string') return;

	const body = [['margin', '2rem']] as any;

	expect(result.matcher).toBe('m-2');
	expect(result.body?.(body)).toEqual([['margin', '-2rem']]);
});
