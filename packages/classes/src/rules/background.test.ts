import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { testRules } from './_test.js';

describe('background gradient', () => {
	it('generates from stop', async () => {
		await testRules('from-main-light', {
			'--🤵-gradient-from-position': '0%',
			'--🤵-gradient-from': `${testBaseMode.schema.$tokens.colors.main.light.var} var(--🤵-gradient-from-position)`,
			'--🤵-gradient-stops': 'var(--🤵-gradient-from), var(--🤵-gradient-to)',
			'--🤵-gradient-to': 'rgb(255 255 255 / 0) var(--🤵-gradient-to-position)',
			'--🤵-gradient-to-position': '100%',
		});
	});
});
