import { describe, expect, it } from 'vitest';
import { testTheme } from '../_test.js';
import { variantDataAttribute, variantTaggedDataAttributes } from './data.js';

const ctx = {
	generator: {
		config: {
			separators: [':'],
		},
	},
	rawSelector: '',
	theme: testTheme,
} as any;

describe('variantDataAttribute', () => {
	it('matches data attribute selector', () => {
		const result = variantDataAttribute.match('data-state=open:bg-red', ctx);
		expect(result).toBeTruthy();
		expect(result).not.toBeTypeOf('string');

		if (!result || typeof result === 'string') return;

		expect(result.matcher).toBe('bg-red');
		expect(result.selector?.('.btn')).toBe('.btn[data-state=open]');
	});

	it('matches tagged peer data selector', async () => {
		const peerVariant = variantTaggedDataAttributes.find(
			(v) => typeof v === 'object' && v.name === 'peer-data',
		);

		expect(peerVariant).toBeTruthy();
		expect(peerVariant).toBeTypeOf('object');

		if (!peerVariant || typeof peerVariant !== 'object') return;

		const result = await peerVariant.match('peer-data-state=open:bg-red', ctx);
		expect(result).toBeTruthy();
		expect(result).not.toBeTypeOf('string');

		if (!result || typeof result === 'string') return;

		const input = {
			entries: [],
			parent: '',
			prefix: '',
			pseudo: '',
			selector: '.item',
		};

		await result.handle?.(input, (next) => Object.assign(input, next));

		expect(result.matcher).toBe('bg-red');
		expect(input.parent).toBe('.item');
		expect(input.selector).toBe('&:is(:where(.peer)[data-state=open] ~ *)');
	});

	it('matches tagged peer data selector with label', async () => {
		const peerVariant = variantTaggedDataAttributes.find(
			(v) => typeof v === 'object' && v.name === 'peer-data',
		);

		expect(peerVariant).toBeTruthy();
		expect(peerVariant).toBeTypeOf('object');

		if (!peerVariant || typeof peerVariant !== 'object') return;

		const result = await peerVariant.match(
			'peer-data-state=open/menu:bg-red',
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
			selector: '.item',
		};

		await result.handle?.(input, (next) => Object.assign(input, next));

		expect(result.matcher).toBe('bg-red');
		expect(input.parent).toBe('.item');
		expect(input.selector).toBe(
			'&:is(:where(.peer\\/menu)[data-state=open] ~ *)',
		);
	});
});
