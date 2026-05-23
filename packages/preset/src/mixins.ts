import { SystemTokens } from '@arbor-css/globals';
import { CreateMixin } from '@arbor-css/functions';

type RefColorMixinTokens = {
	applied: { name: string; var: string };
	final: { name: string; var: string };
	opacity: { name: string; var: string };
	contrast?: { name: string; var: string };
};

function createRefColorMixin(
	createMixinValue: CreateMixin,
	systemRef: {
		applied: { name: string; var: string };
		$root: { name: string; var: string };
		opacity: { name: string; var: string };
		contrast?: { name: string; var: string };
	},
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
	return createMixinValue(name, {
		description,
		parameters: ['--color'] as const,
		definition: (css, { parameters: [color], tokens }) => {
			const mixinTokens = tokens as RefColorMixinTokens;
			return {
				[mixinTokens.applied.name]: css`${color}`,
				[mixinTokens.final.name]: css`${mixinTokens.applied.var}`,
				[mixinTokens.opacity.name]: css`1`,
				...(mixinTokens.contrast ?
					{ [mixinTokens.contrast.name]: css`${mixinTokens.applied.var}` }
				:	{}),
				[systemRef.applied.name]: css`${mixinTokens.applied.var}`,
				[systemRef.$root.name]: css`${mixinTokens.final.var}`,
				[systemRef.opacity.name]: css`${mixinTokens.opacity.var}`,
				...(systemRef.contrast && mixinTokens.contrast ?
					{ [systemRef.contrast.name]: css`${mixinTokens.contrast.var}` }
				:	{}),
				[property]: css`${systemRef.$root.var}`,
			};
		},
		contributeTokens: {
			applied: {
				purpose: 'color',
				description: `The resolved source color for ${property}.`,
			},
			final: {
				purpose: 'color',
				description: `The final ${property} value applied by Arbor.`,
			},
			opacity: {
				purpose: 'other',
				description: `The opacity Arbor applies to ${property}.`,
			},
			...(systemRef.contrast ? {
				contrast: {
					purpose: 'color',
					description:
						'Color used when deriving a contrast foreground from the background.',
				},
			} : {}),
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

	const fg = createRefColorMixin(createMixinValue, systemProps.ref.fg, {
		name: 'fg',
		property: 'color',
		description:
			'Routes color assignments through Arbor ref variables for runtime adjustments.',
	});

	const bg = createRefColorMixin(createMixinValue, systemProps.ref.bg, {
		name: 'bg',
		property: 'background',
		description:
			'Routes background color assignments through Arbor ref variables for runtime adjustments.',
	});

	const border = createRefColorMixin(
		createMixinValue,
		systemProps.ref.borderColor[''],
		{
			name: 'border',
			property: 'border-color',
			description:
				'Routes border color assignments through Arbor ref variables for runtime adjustments.',
		},
	);

	const fill = createRefColorMixin(createMixinValue, systemProps.ref.fill, {
		name: 'fill',
		property: 'fill',
		description:
			'Routes SVG fill assignments through Arbor ref variables for runtime adjustments.',
	});

	const stroke = createRefColorMixin(createMixinValue, systemProps.ref.stroke, {
		name: 'stroke',
		property: 'stroke',
		description:
			'Routes SVG stroke assignments through Arbor ref variables for runtime adjustments.',
	});

	const accent = createRefColorMixin(createMixinValue, systemProps.ref.accent, {
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
