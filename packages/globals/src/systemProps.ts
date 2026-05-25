import { CreateToken } from '@arbor-css/tokens';
import { createGlobalProps } from './globalProps.js';

export function createSystemProps({
	createMetaToken,
}: {
	createMetaToken: CreateToken;
}) {
	const $labelProps = {
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
	};

	const $dynamicProps = {
		shadowColor: createMetaToken('shadow-color', {
			description:
				'Stores the computed shadow color currently applied to the element.',
			tag: 'system',
			type: 'color',
			fallback: 'rgba(0, 0, 0, 0.1)',
		}),
		shadowReverse: createMetaToken('shadow-reverse', {
			description: 'Flips shadow direction for inverse elevation treatments.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
	};

	const $schemeProps = {
		invertMultiplier: createMetaToken('scheme-invert-mult', {
			description:
				'Switches scheme-aware calculations between light and dark behavior.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		whenDark: createMetaToken('scheme-when-dark', {
			description: 'Resolves to 1 in dark schemes and 0 in light schemes.',
			tag: 'system',
			type: 'number',
			fallback: 0,
		}),
		whenLight: createMetaToken('scheme-when-light', {
			description: 'Resolves to 1 in light schemes and 0 in dark schemes.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		trueLight: createMetaToken('scheme-true-light', {
			description:
				'Provides an absolute light reference color that does not change with scheme.',
			tag: 'system',
			type: 'color',
			fallback: 'white',
		}),
		trueHeavy: createMetaToken('scheme-true-heavy', {
			description:
				'Provides an absolute dark reference color that does not change with scheme.',
			tag: 'system',
			type: 'color',
			fallback: 'black',
		}),
	};

	return {
		// metadata
		meta: {
			...$labelProps,
			scheme: $schemeProps,
		},
		// dynamic values
		dynamic: $dynamicProps,
		// scheme information
		global: createGlobalProps({ createToken: createMetaToken }),
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
