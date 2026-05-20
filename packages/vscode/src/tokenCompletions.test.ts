import { createTokenFactory } from '@arbor-css/core';
import { expect, it } from 'vitest';
import { getTokenCompletions } from './tokenCompletions.js';
import { TokenMap } from './tokenProvider.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

it('finds tokens or namespaces one level above the current segment', () => {
	const tokenMap: TokenMap = new Map([
		['--x-action-primary-fg', createToken('action-primary-fg')],
		['--x-action-primary-bg', createToken('action-primary-bg')],
	]);

	const firstLevel = getTokenCompletions(tokenMap, '--x');
	expect(firstLevel).toEqual([{ name: '--x-action', value: 'namespace' }]);

	const secondLevel = getTokenCompletions(tokenMap, '--x-action');
	expect(secondLevel).toEqual([
		{ name: '--x-action-primary', value: 'namespace' },
	]);

	const thirdLevel = getTokenCompletions(tokenMap, '--x-action-primary');
	expect(thirdLevel).toEqual([
		{
			name: '--x-action-primary-fg',
			value: tokenMap.get('--x-action-primary-fg'),
		},
		{
			name: '--x-action-primary-bg',
			value: tokenMap.get('--x-action-primary-bg'),
		},
	]);
});

it('handles partial completion of segments', () => {
	const tokenMap: TokenMap = new Map([
		['--x-action-primary-fg', createToken('action-primary-fg')],
		['--x-action-primary-bg', createToken('action-primary-bg')],
	]);

	const partialSegment = getTokenCompletions(tokenMap, '--x-action-p');
	expect(partialSegment).toEqual([
		{ name: '--x-action-primary', value: 'namespace' },
	]);
});

it('handles leading - in the rest of the segment', () => {
	const tokenMap: TokenMap = new Map([
		['--x-color-primary', createToken('color-primary')],
		['--x-color-secondary', createToken('color-secondary')],
	]);

	const partialSegment = getTokenCompletions(tokenMap, '--x-color-');
	expect(partialSegment).toEqual([
		{ name: '--x-color-primary', value: tokenMap.get('--x-color-primary') },
		{ name: '--x-color-secondary', value: tokenMap.get('--x-color-secondary') },
	]);
});
