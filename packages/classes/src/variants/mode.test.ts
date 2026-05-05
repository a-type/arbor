import { it } from 'vitest';
import { testVariants } from './_test.js';
import { modeVariants } from './mode.js';

it('applies named mode parent selector', async () => {
	await testVariants(modeVariants, '@mode-demo:bg-red', 'bg-red', {
		parent: '.\\@mode-demo',
	});
});
