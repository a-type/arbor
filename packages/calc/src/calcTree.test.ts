import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { extractLiteralFromSimpleCalc } from './calcTree.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

describe('extractLiteralFromSimpleCalc', () => {
	it('should extract the literal value from a simple calc expression', () => {
		expect(extractLiteralFromSimpleCalc('calc(10px)')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(  5em  )')).toBe('5em');
		expect(extractLiteralFromSimpleCalc('calc(-3.5%)')).toBe('-3.5%');
		expect(extractLiteralFromSimpleCalc('calc((10px))')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(l)')).toBe('l');
	});

	it('should return the original value if it is not a simple calc expression', () => {
		expect(extractLiteralFromSimpleCalc('10px')).toBe('10px');
		expect(extractLiteralFromSimpleCalc('calc(10px + 5px)')).toBe(
			'calc(10px + 5px)',
		);
		expect(extractLiteralFromSimpleCalc('calc(var(--x) + 5px)')).toBe(
			'calc(var(--x) + 5px)',
		);
	});
});
