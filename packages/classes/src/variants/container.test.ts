import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantContainerQuery } from './container.js';

it('applies literal container min-width query', async () => {
	await testVariants([variantContainerQuery], '@320:bg-red', 'bg-red', {
		parent: '@container (min-width: 320px)',
		parentOrder: 999,
	});
});
