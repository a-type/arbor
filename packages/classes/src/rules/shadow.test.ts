import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { testRules } from './_test.js';
import { shadowRules } from './shadow.js';

describe('shadow', () => {
	it('matches text shadow from theme tokens', async () => {
		await testRules(shadowRules, 'text-shadow-md', {
			'text-shadow': `${testBaseMode.schema.$tokens.shadow.md.x.var} ${testBaseMode.schema.$tokens.shadow.md.y.var} ${testBaseMode.schema.$tokens.shadow.md.blur.var} ${testBaseMode.schema.$tokens.shadow.md.color.var}`,
		});
	});

	it('matches literal text shadow values', async () => {
		await testRules(shadowRules, 'text-shadow-[2px_2px_4px_red]', {
			'text-shadow': '2px 2px 4px red',
		});
	});
});
