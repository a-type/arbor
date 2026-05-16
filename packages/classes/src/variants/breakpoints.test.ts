import { expect, it } from 'vitest';
import { testVariants } from './_test.js';
import { variants } from './index.js';

it('matches theme breakpoints', async () => {
	await testVariants(variants, 'sm:bg-[red]', 'bg-[red]', {
		parent: '@media (min-width: 640px)',
		parentOrder: expect.anything(),
	});
});

it('matches theme breakpoints with glt syntax', async () => {
	await testVariants(variants, 'lt-sm:bg-[red]', 'bg-[red]', {
		parent: '@media (max-width: 639.9px)',
		parentOrder: expect.anything(),
	});
});
