import { expect, it } from 'vitest';
import { simplifyPreprocessCss } from './simplification.js';

it('simplifies same-unit division in calc()', () => {
	expect(simplifyPreprocessCss(`calc(10px / 5px)`)).toEqual(`calc(2)`);
});

it('simplifies nested same-unit division in calc()', () => {
	expect(simplifyPreprocessCss(`calc((4px / 2px) * 2 * 10px)`)).toEqual(
		`calc((2) * 2 * 10px)`,
	);
});

it('does not simplify division of different units', () => {
	expect(simplifyPreprocessCss(`calc(10px / 5em)`)).toEqual(`calc(10px / 5em)`);
});

it('does not simplify division when units are missing', () => {
	expect(simplifyPreprocessCss(`calc(10 / 5)`)).toEqual(`calc(10 / 5)`);
});
