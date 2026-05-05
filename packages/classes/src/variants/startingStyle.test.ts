import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantStartingStyle } from './startingStyle.js';

it('applies @starting-style parent at-rule', async () => {
	await testVariants([variantStartingStyle], 'starting:bg-red', 'bg-red', {
		parent: '@starting-style',
	});
});