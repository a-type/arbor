import { it } from 'vitest';
import { testVariants } from './_test.js';
import { variantLanguageDirections } from './directions.js';

it('applies direction', async () => {
	await testVariants(variantLanguageDirections, 'rtl:bg-red', 'bg-red', {
		prefix: '[dir="rtl"] $$ ',
	});
});
