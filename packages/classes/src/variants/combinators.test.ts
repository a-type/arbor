import { expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import { testVariants } from './_test.js';
import { variantCombinators, variantSvgCombinators } from './combinators.js';

const ctx = {
	generator: {
		config: {
			separators: [':'],
		},
	},
	rawSelector: '',
	theme: testTheme,
} as any;

it('matches explicit combinator scope selector', async () => {
	const childrenVariant = variantCombinators.find(
		(v) => typeof v === 'object' && v.name === 'combinator:children',
	);

	expect(childrenVariant).toBeTruthy();
	expect(childrenVariant).toBeTypeOf('object');

	if (!childrenVariant || typeof childrenVariant !== 'object') return;

	const result = await childrenVariant.match('children-[button]:bg-red', ctx);
	expect(result).toBeTruthy();
	expect(result).not.toBeTypeOf('string');

	if (!result || typeof result === 'string') return;

	expect(result.matcher).toBe('bg-red');
	expect(result.selector?.('.x')).toBe('.x>button');
});

it('matches svg descendant combinator', async () => {
	await testVariants(variantSvgCombinators, 'svg:bg-red', 'bg-red', {
		selector: ' svg',
	});
});
