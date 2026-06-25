import { expect, it } from 'vitest';
import { replaceCssFunctionCall } from './replaceFunctionCall.js';

it('replaces a function without params', () => {
	expect(
		replaceCssFunctionCall(
			'--fn-test()',
			'--fn',
			(name) => `replaced "${name}"`,
		),
	).toBe('replaced "--fn-test"');
});

it('replaces a function call with no params at all', () => {
	expect(
		replaceCssFunctionCall('--fn-test', '--fn', (name) => `replaced "${name}"`),
	).toBe('replaced "--fn-test"');
});

it('replaces a function with params', () => {
	expect(
		replaceCssFunctionCall(
			'--fn-test(1, 2, 3)',
			'--fn',
			(name, args) => `replaced(${name}, ${args.join(', ')})`,
		),
	).toBe('replaced(--fn-test, 1, 2, 3)');
});

it('replaces a function with nested params', () => {
	expect(
		replaceCssFunctionCall(
			'--fn-test(1, --fn-nested(2, 3), 4)',
			'--fn',
			(name, args) => `replaced(${name}, ${args.join(', ')})`,
		),
	).toBe('replaced(--fn-test, 1, --fn-nested(2, 3), 4)');
});

it('handles complex params with their own params', () => {
	expect(
		replaceCssFunctionCall(
			'--fn-test(color-mix(red, blue 10%), 1)',
			'--fn',
			(name, args) => `replaced(${name}, ${args.join(', ')})`,
		),
	).toBe('replaced(--fn-test, color-mix(red, blue 10%), 1)');
});
