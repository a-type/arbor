import { expect, it } from 'vitest';
import { replaceTopLevelTerms } from './replaceTopLevelTerms.js';

it('replaces top-level terms in a string', () => {
	const input = 'foo(bar( baz )) qux (a b)';
	const result = replaceTopLevelTerms(input, (term) => `<<${term}>>`);
	expect(result).toBe('<<foo(bar( baz ))>> <<qux>> <<(a b)>>');
});

it('preserves whitespace', () => {
	const input = '  foo   bar  ';
	const result = replaceTopLevelTerms(input, (term) => `<<${term}>>`);
	expect(result).toBe('  <<foo>>   <<bar>>  ');
});

it('handles empty input', () => {
	const input = '';
	const result = replaceTopLevelTerms(input, (term) => `<<${term}>>`);
	expect(result).toBe('');
});
