import { createToken } from '@arbor-css/preset';
import { describe, expect, it } from 'vitest';
import { customPropertyRe } from './regex.js';

describe('custom property regex', () => {
	it('matches theme tokens', () => {
		expect(customPropertyRe.exec(createToken('🧑‍🚀-test', {}).name)?.[1]).toBe(
			'--🧑‍🚀-test',
		);
	});
});
