import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantCssLayer } from './layer.js';

it('applies css layer parent rule', async () => {
	await testVariants([variantCssLayer], '@layer-components:bg-red', 'bg-red', {
		parent: '@layer components',
	});
});
