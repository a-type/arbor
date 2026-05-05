import { expect, it } from 'vitest';
import { placeholderModifier } from './placeholder.js';

it('rewrites placeholder color utilities for placeholder rule matching', () => {
	const result = placeholderModifier('placeholder-red');
	expect(result).toEqual({ matcher: 'placeholder-$ placeholder-red' });
});

it('rewrites placeholder opacity utilities', () => {
	const result = placeholderModifier('placeholder-op-50%');
	expect(result).toEqual({ matcher: 'placeholder-$ placeholder-op-50%' });
});
