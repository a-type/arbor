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
	createToken: createTokenValue,
}: {
	createToken: CreateToken;
}) {
	const $labelProps = {
		modeName: createTokenValue('modeName', {
			description:
				'Labels the currently applied mode name for debugging and styling hooks.',
			tag: 'system',
			type: 'string',
		}),
		schemeName: createTokenValue('schemeName', {
			description:
				'Labels the active color scheme name for debugging and styling hooks.',
			tag: 'system',
			type: 'string',
		}),
	};

	const $dynamicProps = {
		shadowColor: createTokenValue('shadow-color', {
			description:
				'Stores the computed shadow color currently applied to the element.',
			tag: 'system',
			type: 'color',
			fallback: 'rgba(0, 0, 0, 0.1)',
		}),
		shadowReverse: createTokenValue('shadow-reverse', {
			description: 'Flips shadow direction for inverse elevation treatments.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
	};

	const $schemeProps = {
		invertMultiplier: createTokenValue('scheme-invert-mult', {
			description:
				'Switches scheme-aware calculations between light and dark behavior.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		whenDark: createTokenValue('scheme-when-dark', {
			description: 'Resolves to 1 in dark schemes and 0 in light schemes.',
			tag: 'system',
			type: 'number',
			fallback: 0,
		}),
		whenLight: createTokenValue('scheme-when-light', {
			description: 'Resolves to 1 in light schemes and 0 in dark schemes.',
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		trueLight: createTokenValue('scheme-true-light', {
			description:
				'Provides an absolute light reference color that does not change with scheme.',
			tag: 'system',
			type: 'color',
			fallback: 'white',
		}),
		trueHeavy: createTokenValue('scheme-true-heavy', {
			description:
				'Provides an absolute dark reference color that does not change with scheme.',
			tag: 'system',
			type: 'color',
			fallback: 'black',
		}),
	};

	const $referenceProps = {
		fg: makeSystemColorTokens('fg', 'foreground color', createTokenValue),
		bg: {
			...makeSystemColorTokens('bg', 'background color', createTokenValue),
			contrast: createTokenValue(`bg-for-contrast`, {
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
				createTokenValue,
			),
			bottom: makeSystemColorTokens(
				'borderColor-bottom',
				'bottom border color',
				createTokenValue,
			),
			top: makeSystemColorTokens(
				'borderColor-top',
				'top border color',
				createTokenValue,
			),
			left: makeSystemColorTokens(
				'borderColor-left',
				'left border color',
				createTokenValue,
			),
			right: makeSystemColorTokens(
				'borderColor-right',
				'right border color',
				createTokenValue,
			),
		},
		ringColor: makeSystemColorTokens(
			'ring',
			'focus ring color',
			createTokenValue,
		),
		ringOffsetColor: makeSystemColorTokens(
			'ring-offset',
			'focus ring offset color',
			createTokenValue,
		),
		shadowColor: makeSystemColorTokens(
			'shadow',
			'shadow color',
			createTokenValue,
		),
		placeholder: makeSystemColorTokens(
			'placeholder',
			'placeholder color',
			createTokenValue,
		),
		accent: makeSystemColorTokens('accent', 'accent color', createTokenValue),
		fill: makeSystemColorTokens('fill', 'fill color', createTokenValue),
		stroke: makeSystemColorTokens('stroke', 'stroke color', createTokenValue),
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
		global: createGlobalProps({ createToken: createTokenValue }),
		// references to applied values for use by mixins,
		// functions, and userland styles
		ref: $referenceProps,
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
