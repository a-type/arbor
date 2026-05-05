import { expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import {
	variantPseudoClassesAndElements,
	variantPseudoClassFunctions,
	variantTaggedPseudoClasses,
} from './pseudo.js';

const ctx = {
	generator: {
		config: {
			separators: [':'],
		},
	},
	rawSelector: '',
	theme: testTheme,
} as any;

it('matches hover pseudo class variant', async () => {
	let matched: any;
	for (const variant of variantPseudoClassesAndElements()) {
		const result = await variant.match('hover:bg-red', ctx);
		if (result) {
			matched = result;
			break;
		}
	}

	expect(matched).toBeTruthy();
	expect(matched).not.toBeTypeOf('string');

	if (!matched || typeof matched === 'string') return;

	expect(matched.matcher).toBe('bg-red');
});

it('matches not(...) pseudo function variant', async () => {
	const variant = variantPseudoClassFunctions();
	const result = await variant.match('not-[.active]:bg-red', ctx);

	expect(result).toBeTruthy();
	expect(result).not.toBeTypeOf('string');

	if (!result || typeof result === 'string') return;

	expect(result.matcher).toBe('bg-red');
});

it('matches tagged pseudo class variant', async () => {
	let matched: any;
	for (const variant of variantTaggedPseudoClasses()) {
		const result = await variant.match('group-hover:bg-red', ctx);
		if (result) {
			matched = result;
			break;
		}
	}

	expect(matched).toBeTruthy();
	expect(matched).not.toBeTypeOf('string');

	if (!matched || typeof matched === 'string') return;

	expect(matched.matcher).toBe('bg-red');
});
