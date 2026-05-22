import { CreateToken } from '@arbor-css/tokens';
import { createGlobalProps } from './globalProps.js';

function makeSystemColorTokens(
	name: string,
	descriptionName: string,
	createTokenValue: CreateToken,
) {
	return {
		applied: createTokenValue(`${name}-applied`, {
			description: `Stores the resolved ${descriptionName} before Arbor applies opacity handling.`,
			tag: 'system',
			type: 'color',
			inherits: true,
		}),
		$root: createTokenValue(`${name}`, {
			description: `Stores the final ${descriptionName} value Arbor applies in CSS.`,
			tag: 'system',
			type: 'color',
			inherits: false,
		}),
		opacity: createTokenValue(`${name}-op`, {
			description: `Controls the opacity Arbor applies to the ${descriptionName}.`,
			tag: 'system',
			type: 'number',
			inherits: false,
			fallback: '100%',
		}),
	};
}

export function createSystemProps({
	createMetaToken,
	createRefToken,
}: {
	createMetaToken: CreateToken;
	createRefToken: CreateToken;
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

	const $referenceProps = {
		fg: makeSystemColorTokens('fg', 'foreground color', createRefToken),
		bg: {
			...makeSystemColorTokens('bg', 'background color', createRefToken),
			contrast: createRefToken(`bg-for-contrast`, {
				description:
					'When present, this color should be used as the color to compute a contrast foreground against.',
				tag: 'system',
				type: 'color',
				inherits: true,
			}),
		},
		borderColor: {
			'': makeSystemColorTokens(
				'borderColor-all',
				'border color',
				createRefToken,
			),
			bottom: makeSystemColorTokens(
				'borderColor-bottom',
				'bottom border color',
				createRefToken,
			),
			top: makeSystemColorTokens(
				'borderColor-top',
				'top border color',
				createRefToken,
			),
			left: makeSystemColorTokens(
				'borderColor-left',
				'left border color',
				createRefToken,
			),
			right: makeSystemColorTokens(
				'borderColor-right',
				'right border color',
				createRefToken,
			),
		},
		ringColor: makeSystemColorTokens(
			'ring',
			'focus ring color',
			createRefToken,
		),
		ringOffsetColor: makeSystemColorTokens(
			'ring-offset',
			'focus ring offset color',
			createRefToken,
		),
		shadowColor: makeSystemColorTokens(
			'shadow',
			'shadow color',
			createRefToken,
		),
		placeholder: makeSystemColorTokens(
			'placeholder',
			'placeholder color',
			createRefToken,
		),
		accent: makeSystemColorTokens('accent', 'accent color', createRefToken),
		fill: makeSystemColorTokens('fill', 'fill color', createRefToken),
		stroke: makeSystemColorTokens('stroke', 'stroke color', createRefToken),
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
		// references to applied values for use by mixins,
		// functions, and userland styles
		ref: $referenceProps,
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
