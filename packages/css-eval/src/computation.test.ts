import { describe, expect, it } from 'vitest';
import { resolveCss } from './computation.js';
import { css } from './interpolation.js';
import { simplifier } from './node.js';

describe('resolveCss with simplification', () => {
	// calc simplification not working yet?
	it('should simplify calc() with a single value', async () => {
		const result = resolveCss(css`calc(10px)`, { simplifier });
		expect(result).toBe('10px');
	});

	it('should substitute variables with their values', async () => {
		const result = resolveCss(css`var(--x)`, {
			propertyValues: { '--x': '20px' },
			simplifier,
		});
		expect(result).toBe('20px');
	});

	it('should simplify calc arithmetic', async () => {
		const result = resolveCss(css`calc(10px + 5px)`, { simplifier });
		expect(result).toBe('15px');
	});

	it('should simplify nested calc expressions', async () => {
		const result = resolveCss(css`calc(10px + calc(5px + 2px))`, {
			simplifier,
		});
		expect(result).toBe('17px');
	});

	it('should simplify calc expressions with variables', async () => {
		const result = resolveCss(css`calc(var(--x) + 5px)`, {
			propertyValues: { '--x': '10px' },
			simplifier,
		});
		expect(result).toBe('15px');
	});

	it('should simplify math fn expressions with static values', async () => {
		let result = resolveCss(css`max(10px, 20px)`, { simplifier });
		expect(result).toBe('20px');

		result = resolveCss(css`min(10px, 20px)`, { simplifier });
		expect(result).toBe('10px');

		result = resolveCss(css`calc(clamp(5px, 10px, 15px))`, { simplifier });
		expect(result).toBe('10px');

		result = resolveCss(css`calc(clamp(5px, calc(10px + 5px), 30px))`, {
			simplifier,
		});
		expect(result).toBe('15px');

		result = resolveCss(css`calc(clamp(5px, var(--x), 30px))`, {
			propertyValues: { '--x': '10px' },
			simplifier,
		});
		expect(result).toBe('10px');
	});

	it('should simplify division of like units', async () => {
		let result = resolveCss(css`calc(10px / 5px)`, { simplifier });
		expect(result).toBe('2');

		result = resolveCss(css`calc((4px / 2px) * 2 * 10px)`, { simplifier });
		expect(result).toBe('40px');
	});
});
