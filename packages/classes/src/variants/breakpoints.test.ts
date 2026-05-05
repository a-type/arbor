import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantBreakpoints } from './breakpoints.js';

it('applies max-width arbitrary breakpoint', async () => {
	await testVariants([variantBreakpoints()], 'max-[640px]:bg-red', 'bg-red', {
		parent: '@media (max-width: 640px)',
	});
});
