import { describe, expect, it } from 'vitest';
import { getFromTheme } from './themeOrLiteral.js';

describe('getFromTheme', () => {
	it('handles empty string root keys', () => {
		const theme = {
			foo: {
				'': 'root value',
			},
		};
		const result = getFromTheme('foo', theme as any, {});
		expect(result).toBe('root value');
	});
});
