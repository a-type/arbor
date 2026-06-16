import { css } from '@arbor-css/css-eval';
import { describe, expect, it } from 'vitest';
import { presetBasic } from './preset.js';

describe('ring function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.ring.compute({
			'--color': 'red',
			'--size': '2px',
			'--offset': '1px',
		});
		expect(result).toEqual(
			css`0 0 0 1px ${presetBasic.$.mode.global.trueLightColor}, 0 0 0 calc(2px + 1px) red`,
		);
	});
});

describe('fade function', () => {
	it('should compute the right value', () => {
		const result = presetBasic.functions.colorFaded.compute({
			'--color': 'red',
			'--opacity': '0.42',
		});
		expect(result).toEqual(css`oklch(from red l c h / 0.42)`);
	});
});

describe('contrast color function', () => {
	it('should compute the right default value', () => {
		const result = presetBasic.functions.colorContrast.compute([]);
		expect(result).toEqual(
			css`contrast-color(var(--mx-bg-contrast, var(--mx-bg-ref, var(--m-global-trueLightColor))))`,
		);
	});
});
