import { CreateMixin } from '@arbor-css/functions';

export function createPresetMixins(
	createMixinValue: CreateMixin,
) {
	const shadow = createMixinValue('shadow', {
		description:
			'Seeds stacked box-shadow layers so ring and shadow portions can be assigned independently.',
		definition: (css, { tokens }) => ({
			[tokens.shadow.name]: css`0 0 0 0 transparent`,
			[tokens.ring.name]: css`0 0 0 0 transparent`,
			'box-shadow': css`
				${tokens.ring.var}, ${tokens.shadow.var}
			`,
		}),
		contributeTokens: {
			shadow: {
				purpose: 'shadow',
				description: 'The main stacked shadow layer used by the shadow mixin.',
			},
			ring: {
				purpose: 'shadow',
				description: 'The ring layer that sits in front of the shadow layer.',
			},
		},
	});

	return {
		shadow,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
