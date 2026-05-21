import { CreateMixin } from '@arbor-css/functions';

export function createPresetMixins(
	tokenPrefix: string,
	createMixinValue: CreateMixin,
) {
	const shadow = createMixinValue('shadow', {
		description:
			'Seeds stacked box-shadow layers so ring and shadow portions can be assigned independently.',
		definition: (css, { tokens }) => ({
			[tokens.shadow.name]: css`0 0 0 0 transparent`,
			[tokens.ring.name]: css`0 0 0 0 transparent`,
			[tokens.ringOffset.name]: css`0 0 0 0 transparent`,
			'box-shadow': css`
				${tokens.ringOffset.var}, ${tokens.ring.var}, ${tokens.shadow.var}
			`,
		}),
		contributeTokens: {
			shadow: 'shadow',
			ring: 'shadow',
			ringOffset: 'shadow',
		},
	});

	return {
		shadow,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
