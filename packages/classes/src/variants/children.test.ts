import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantChildren } from './children.js';

it('matches direct children selector variant', async () => {
	await testVariants(variantChildren, '*:bg-red', 'bg-red', {
		selector: ' > *',
	});
});
