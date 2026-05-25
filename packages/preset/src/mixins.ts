import { CreateMixin } from '@arbor-css/functions';
import { SystemTokens } from '@arbor-css/globals';

function createRefColorMixin(
	createMixinValue: CreateMixin,
	{
		name,
		property,
		description,
	}: {
		name: string;
		property: string;
		description: string;
	},
) {
	const includeContrast = property === 'background';
	return createMixinValue(name, {
		description,
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color], tokens }) => {
			return {
				[tokens.applied.name]: css`
					${color}
				`,
				[tokens.ref.name]: css`
					${tokens.applied.var}
				`,
				...(tokens.contrast ?
					{
						[tokens.contrast.name]: css`
							${tokens.applied.var}
						`,
					}
				:	{}),
				[tokens.applied.name]: css`
					${tokens.applied.var}
				`,
				[tokens.ref.name]: css`
					${tokens.ref.var}
				`,
				...(tokens.contrast ?
					{
						[tokens.contrast.name]: css`
							${tokens.applied.var}
						`,
					}
				:	{}),
				[property]: css`
					${tokens.ref.var}
				`,
			};
		},
		contributeTokens: {
			applied: {
				purpose: 'color',
				description: `The resolved source color for ${property}.`,
			},
			ref: {
				purpose: 'color',
				description: `The final ${property} value applied by Arbor.`,
			},
			...(includeContrast ?
				{
					contrast: {
						purpose: 'color',
						description:
							'Color used when deriving a contrast foreground from the background.',
					},
				}
			:	{}),
		},
	});
}

export function createPresetMixins(
	systemProps: SystemTokens,
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
				description:
					'A "ring" shadow, often used as a focus indicator. See the "ring" function.',
			},
		},
	});

	// colors
	const fg = createRefColorMixin(createMixinValue, {
		name: 'fg',
		property: 'color',
		description:
			'Routes color assignments through Arbor ref variables for runtime adjustments.',
	});

	const bg = createRefColorMixin(createMixinValue, {
		name: 'bg',
		property: 'background',
		description:
			'Routes background color assignments through Arbor ref variables for runtime adjustments.',
	});

	const border = createRefColorMixin(createMixinValue, {
		name: 'border',
		property: 'border-color',
		description:
			'Routes border color assignments through Arbor ref variables for runtime adjustments.',
	});

	const fill = createRefColorMixin(createMixinValue, {
		name: 'fill',
		property: 'fill',
		description:
			'Routes SVG fill assignments through Arbor ref variables for runtime adjustments.',
	});

	const stroke = createRefColorMixin(createMixinValue, {
		name: 'stroke',
		property: 'stroke',
		description:
			'Routes SVG stroke assignments through Arbor ref variables for runtime adjustments.',
	});

	const accent = createRefColorMixin(createMixinValue, {
		name: 'accent',
		property: 'accent-color',
		description:
			'Routes accent-color assignments through Arbor ref variables for runtime adjustments.',
	});

	return {
		accent,
		bg,
		border,
		fill,
		fg,
		shadow,
		stroke,
	} as const;
}

export type BuiltinMixins = ReturnType<typeof createPresetMixins>;
