import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantSupports } from './variantSupports.js';

it('applies supports at-rule wrapper', async () => {
	await testVariants(
		[variantSupports],
		'supports-[display:grid]:bg-red',
		'bg-red',
		{
			parent: '@supports (display:grid)',
		},
	);
});
