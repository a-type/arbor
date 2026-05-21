import { expect, it } from 'vitest';
import { createTokenFactory } from './createToken.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

it('stores token descriptions and preserves them on derived tokens', () => {
	const token = createToken('action-primary-bg', {
		description: 'Background color for the primary action treatment.',
		type: 'color',
	});

	expect(token.description).toBe(
		'Background color for the primary action treatment.',
	);
	expect(token.suffixed('hover').description).toBe(token.description);
	expect(token.prefixed('data').description).toBe(token.description);
});
