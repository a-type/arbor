import { describe, expect, it } from 'vitest';
import { resolveCss } from './computation.js';
import { css } from './interpolation.js';

describe('resolveCss', () => {
	// calc simplification not working yet?
	it('should simplify calc() with a single value', async () => {
		const result = await resolveCss(css`calc(10px)`);
		expect(result).toBe('10px');
	});

	it('should substitute variables with their values', async () => {
		const result = await resolveCss(css`var(--x)`, {
			propertyValues: { '--x': '20px' },
		});
		expect(result).toBe('20px');
	});

	it('should simplify calc arithmetic', async () => {
		const result = await resolveCss(css`calc(10px + 5px)`);
		expect(result).toBe('15px');
	});

	it('should simplify nested calc expressions', async () => {
		const result = await resolveCss(css`calc(10px + calc(5px + 2px))`);
		expect(result).toBe('17px');
	});

	it('should simplify calc expressions with variables', async () => {
		const result = await resolveCss(css`calc(var(--x) + 5px)`, {
			propertyValues: { '--x': '10px' },
		});
		expect(result).toBe('15px');
	});

	it('should simplify math fn expressions with static values', async () => {
		let result = await resolveCss(css`max(10px, 20px)`);
		expect(result).toBe('20px');

		result = await resolveCss(css`min(10px, 20px)`);
		expect(result).toBe('10px');

		result = await resolveCss(css`clamp(5px, 10px, 15px)`);
		expect(result).toBe('10px');

		result = await resolveCss(css`clamp(5px, calc(10px + 5px), 30px)`);
		expect(result).toBe('15px');

		result = await resolveCss(css`clamp(5px, var(--x), 30px)`, {
			propertyValues: { '--x': '10px' },
		});
		expect(result).toBe('10px');
	});
});
