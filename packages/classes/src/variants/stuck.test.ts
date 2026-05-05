import { it } from 'vitest';
import { testVariants } from './_test.js';
import { stuckVariant } from './stuck.js';

it('applies stuck position container query', async () => {
	await testVariants([stuckVariant], 'stuck-top:bg-red', 'bg-red', {
		parent: '@container scroll-state(stuck: top)',
	});
});
