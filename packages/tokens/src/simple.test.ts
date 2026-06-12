import { expect, it } from 'vitest';
import { createTokenFactory } from './createToken.js';
import { convertSimpleTokenSchema } from './simple.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });

it('converts object-form simple token definitions with descriptions', () => {
	const tokens = convertSimpleTokenSchema(
		{
			colors: {
				main: {
					$root: {
						purpose: 'color',
						description: 'Main color used by the palette.',
					},
					bg: 'color',
				},
			},
		},
		'root',
		createToken,
	);

	expect(tokens.colors.main.$root.description).toBe(
		'Main color used by the palette.',
	);
	expect(tokens.colors.main.bg.description).toBeUndefined();
});

it('supports passing full fledged tokens', () => {
	const existingToken = createToken('existing', { purpose: 'color' });
	const tokens = convertSimpleTokenSchema(
		{
			colors: {
				main: {
					$root: existingToken,
					bg: 'color',
				},
			},
		},
		'root',
		createToken,
	);

	expect(tokens.colors.main.$root).toBe(existingToken);
	expect(tokens.colors.main.bg.purpose).toBe('color');
});
