import { describe, expect, it } from 'vitest';
import { presetBasic } from './preset.js';

describe('ring function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.ring.compute(['red', '2px', '1px'], {
			propertyValues: {},
		});
		expect(result).toBe(
			`0 0 0 1px ${presetBasic.$.mode.global.trueLightColor.var}, 0 0 0 3px red`,
		);
	});
});

describe('fade function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.fade.compute(['red', '42%'], {
			propertyValues: {},
		});
		expect(result).toBe(`oklch(from red l c h / 42%)`);
	});
});

describe('contrast color function', () => {
	it('should compute the right default value', () => {
		const result = presetBasic.functions.contrastColor.compute([], {
			propertyValues: {},
		});
		expect(result).toBe(
			`contrast-color(var(--mx-bg-contrast, var(--mx-bg-ref, var(--m-global-trueLightColor))))`,
		);
	});
});
