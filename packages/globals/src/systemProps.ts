import { CreateToken } from '@arbor-css/tokens';

export function createSystemProps({
	createMetaToken,
}: {
	createMetaToken: CreateToken;
}) {
	return {
		// metadata
		meta: {
			modeName: createMetaToken('modeName', {
				description:
					'Labels the currently applied mode name for debugging and styling hooks.',
				tag: 'system',
				type: 'string',
			}),
			schemeName: createMetaToken('schemeName', {
				description:
					'Labels the active color scheme name for debugging and styling hooks.',
				tag: 'system',
				type: 'string',
			}),
		},
		env: {
			prefersLight: createMetaToken('prefersLight', {
				type: 'number',
				purpose: 'scalar',
				description:
					'Indicates whether the user has a light color scheme preference: 1 or 0.',
				tag: 'system',
			}),
			prefersDark: createMetaToken('prefersDark', {
				type: 'number',
				purpose: 'scalar',
				description:
					'Indicates whether the user has a dark color scheme preference: 1 or 0.',
				tag: 'system',
			}),
		},
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
