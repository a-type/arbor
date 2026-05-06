import { VariantObject } from 'unocss';
import { expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import { variantInert } from './inert.js';

it('wraps selector in inert scope', async () => {
	const ctx = {
		generator: {
			config: {
				separators: [':'],
			},
		},
		rawSelector: '',
		theme: testTheme,
	} as any;

	const result = await (variantInert as VariantObject).match?.(
		'inert:bg-red',
		ctx,
	);
	expect(result).toBeTruthy();
	expect(result).not.toBeTypeOf('string');

	if (!result || typeof result === 'string' || Array.isArray(result)) return;

	const input = {
		entries: [],
		parent: '',
		prefix: '',
		pseudo: '',
		selector: '.btn',
	};

	await result.handle?.(input, (next) => Object.assign(input, next));

	expect(result.matcher).toBe('bg-red');
	expect(input.parent).toBe('.btn');
	expect(input.selector).toBe('&:is([inert],[inert] *)');
});
