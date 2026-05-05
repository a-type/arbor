import { expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import { variantImportant } from './important.js';

it('appends !important to declaration values', () => {
	const ctx = {
		generator: {
			config: {
				separators: [':'],
			},
		},
		rawSelector: '',
		theme: testTheme,
	} as any;

	const result = variantImportant().match('!bg-red', ctx);
	expect(result).toBeTruthy();
	expect(result).not.toBeTypeOf('string');

	if (!result || typeof result === 'string') return;

	const body = [['color', 'red']] as any;
	expect(result.matcher).toBe('bg-red');
	expect(result.body?.(body)).toEqual([['color', 'red !important']]);
});
