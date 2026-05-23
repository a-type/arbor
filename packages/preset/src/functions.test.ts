import { createGlobalContext } from '@arbor-css/globals';
import { describe, expect, it } from 'vitest';
import { createPresetFunctions } from './functions.js';

const ctx = createGlobalContext();
const fns = createPresetFunctions(ctx.$systemTokens, ctx.createFunction);

describe('ring function', () => {
	it('should compute the right value', () => {
		const result = fns.ring.compute({
			'--color': 'red',
			'--size': '2px',
			'--offset': '1px',
		});
		expect(result).toBe(
			`0 0 0 1px ${ctx.$systemTokens.ref.bg.$root.var}, 0 0 0 calc(3px) red`,
		);
	});
});

describe('fade function', () => {
	it('should compute the right value', () => {
		const result = fns.fade.compute({
			'--color': 'red',
			'--opacity': '42%',
		});
		expect(result).toBe(`oklch(from red l c h / 42%)`);
	});
});
