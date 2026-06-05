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
				tag: 'meta',
				type: 'string',
			}),
			schemeName: createMetaToken('schemeName', {
				description:
					'Labels the active color scheme name for debugging and styling hooks.',
				tag: 'meta',
				type: 'string',
			}),
		},
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
