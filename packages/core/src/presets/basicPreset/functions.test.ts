import { describe, expect, it } from 'vitest';
import { presetBasic } from './preset.js';

describe('ring function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.ring.compute({
			'--color': 'red',
			'--size': '2px',
			'--offset': '1px',
		});
		expect(result).toBe(
			`0 0 0 1px ${presetBasic.$.system.meta.scheme.trueLight.var}, 0 0 0 calc(3px) red`,
		);
	});
});

describe('fade function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.fade.compute({
			'--color': 'red',
			'--opacity': '42%',
		});
		expect(result).toBe(`oklch(from red l c h / 42%)`);
	});
});
