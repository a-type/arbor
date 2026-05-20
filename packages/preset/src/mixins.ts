import { CreateMixin } from '@arbor-css/mixins';

export function createPresetMixins(
	tokenPrefix: string,
	createMixinValue: CreateMixin,
) {
	const shadowVariable = `${tokenPrefix}system-shadow`;
	const ringVariable = `${tokenPrefix}system-ring`;

	const shadow = createMixinValue('shadow', {
		description:
			'Seeds stacked box-shadow layers so ring and shadow portions can be assigned independently.',
		definition: (css) => [
			{
				prop: shadowVariable,
				value: css`
					${'0 0 0 0 transparent'}
				`,
			},
			{
				prop: ringVariable,
				value: css`
					${'0 0 0 0 transparent'}
				`,
			},
			{
				prop: 'box-shadow',
				value: css`
					${`var(${ringVariable}), var(${shadowVariable})`}
				`,
			},
		],
	});

	return {
		shadow,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
