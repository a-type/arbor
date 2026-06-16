import { describe, expect, it } from 'vitest';
import {
	isSingleValue,
	unwrapDummyAssignment,
	wrapWithDummyAssignment,
} from './util.js';

describe('isSingleValue', () => {
	it('should match literals', () => {
		expect(isSingleValue('10px')).toBe(true);
		expect(isSingleValue('var(--x)')).toBe(true);
	});
	it('should match if() usage', () => {
		expect(isSingleValue('if(style(--foo: 1): 10px)')).toBe(true);
		expect(isSingleValue('if(style(--foo: 1): 10px; else: 20px)')).toBe(true);
	});
	it('should not match assignments', () => {
		expect(isSingleValue('--x: 10px')).toBe(false);
		expect(isSingleValue('--x: var(--y)')).toBe(false);
	});
	it('should not match blocks', () => {
		expect(isSingleValue('color: red;')).toBe(false);
		expect(isSingleValue('&:hover { color: red; }')).toBe(false);
	});
});

// more of a sanity check - the transform does something,
// and is reversed by the unwrap function.
describe('wrapWithDummyAssignment', () => {
	it('should wrap a single value with a dummy assignment', () => {
		expect(wrapWithDummyAssignment('10px')).not.toBe('10px');
		expect(unwrapDummyAssignment(wrapWithDummyAssignment('10px'))).toBe(`10px`);
	});

	it('should wrap a complex value with a dummy assignment', () => {
		const complexValue = 'if(style(--foo: 1): 10px; else: 20px)';
		expect(wrapWithDummyAssignment(complexValue)).not.toBe(complexValue);
		expect(unwrapDummyAssignment(wrapWithDummyAssignment(complexValue))).toBe(
			complexValue,
		);
	});
});
