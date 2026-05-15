import { it } from 'vitest';
import { testRules } from './_test.js';

it('sets opacity', async () => {
	await testRules('op-50', {
		opacity: '0.5',
	});
});
