import { describe, expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import { variantAria, variantTaggedAriaAttributes } from './aria.js';

const ctx = {
	generator: {
		config: {
			separators: [':'],
		},
	},
	rawSelector: '',
	theme: testTheme,
} as any;

describe('variantAria', () => {
	it('matches aria attribute selector', () => {
		const result = variantAria.match('aria-expanded:bg-red', ctx);
		expect(result).toBeTruthy();
		expect(result).not.toBeTypeOf('string');

		if (!result || typeof result === 'string') return;

		expect(result.matcher).toBe('bg-red');
		expect(result.selector?.('.btn')).toBe('.btn[aria-expanded]');
	});

	it('matches tagged group aria selector', async () => {
		const groupVariant = variantTaggedAriaAttributes.find(
			(v) => typeof v === 'object' && v.name === 'group-aria',
		);

		expect(groupVariant).toBeTruthy();
		expect(groupVariant).toBeTypeOf('object');

		if (!groupVariant || typeof groupVariant !== 'object') return;

		const result = await groupVariant.match('group-aria-expanded:bg-red', ctx);
		expect(result).toBeTruthy();
		expect(result).not.toBeTypeOf('string');

		if (!result || typeof result === 'string') return;

		const input = {
			entries: [],
			parent: '',
			prefix: '',
			pseudo: '',
			selector: '.btn',
		};

		await result.handle?.(input, (next) => Object.assign(input, next));

		expect(result.matcher).toBe('bg-red');
		expect(input.parent).toBe('.btn');
		expect(input.selector).toBe('&:is(:where(.group)[aria-expanded] *)');
	});

	it('matches tagged group aria selector with label', async () => {
		const groupVariant = variantTaggedAriaAttributes.find(
			(v) => typeof v === 'object' && v.name === 'group-aria',
		);

		expect(groupVariant).toBeTruthy();
		expect(groupVariant).toBeTypeOf('object');

		if (!groupVariant || typeof groupVariant !== 'object') return;

		const result = await groupVariant.match(
			'group-aria-expanded/menu:bg-red',
			ctx,
		);
		expect(result).toBeTruthy();
		expect(result).not.toBeTypeOf('string');

		if (!result || typeof result === 'string') return;

		const input = {
			entries: [],
			parent: '',
			prefix: '',
			pseudo: '',
			selector: '.btn',
		};

		await result.handle?.(input, (next) => Object.assign(input, next));

		expect(result.matcher).toBe('bg-red');
		expect(input.parent).toBe('.btn');
		expect(input.selector).toBe('&:is(:where(.group\\/menu)[aria-expanded] *)');
	});
});
