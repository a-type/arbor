import { TOKEN_PREFIX } from '@arbor-css/tokens';
import { expect, it } from 'vitest';
import { tokenifyColors } from './tokenifyColors';

it('tokenifyColors should convert color values to tokens', () => {
	const input = {
		primary: {
			light: '#fff',
			dark: '#000',
		},
	};
	const output = tokenifyColors(input);
	expect(output).toEqual({
		primary: {
			light: expect.objectContaining({
				type: 'color',
				name: `${TOKEN_PREFIX}-primary-light`,
			}),
			dark: expect.objectContaining({
				type: 'color',
				name: `${TOKEN_PREFIX}-primary-dark`,
			}),
		},
	});
});
