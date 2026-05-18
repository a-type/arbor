import { CreateToken } from '@arbor-css/tokens';
import { GlobalConfigProps } from './globalProps.js';

function makeSystemColorTokens(name: string, createTokenValue: CreateToken) {
	return {
		applied: createTokenValue(`${name}-applied`, {
			tag: 'system',
			type: 'color',
			inherits: true,
		}),
		$root: createTokenValue(`${name}`, {
			tag: 'system',
			type: 'color',
			inherits: false,
		}),
		opacity: createTokenValue(`${name}-op`, {
			tag: 'system',
			type: 'number',
			inherits: false,
			fallback: '100%',
		}),
	};
}

export function createSystemProps({
	createToken: createTokenValue,
	globalProps,
}: {
	createToken: CreateToken;
	globalProps: GlobalConfigProps;
}) {
	const $labelProps = {
		mode: createTokenValue('mode', { tag: 'system', type: 'string' }),
		scheme: createTokenValue('scheme', { tag: 'system', type: 'string' }),
	};

	const $dynamicProps = {
		shadowColor: createTokenValue('shadow-color', {
			tag: 'system',
			type: 'color',
			fallback: 'rgba(0, 0, 0, 0.1)',
		}),
		shadowReverse: createTokenValue('shadow-reverse', {
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
	};

	const $schemeProps = {
		invertMultiplier: createTokenValue('scheme-invert-mult', {
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		whenDark: createTokenValue('scheme-when-dark', {
			tag: 'system',
			type: 'number',
			fallback: 0,
		}),
		whenLight: createTokenValue('scheme-when-light', {
			tag: 'system',
			type: 'number',
			fallback: 1,
		}),
		trueLight: createTokenValue('scheme-true-light', {
			tag: 'system',
			type: 'color',
			fallback: 'white',
		}),
		trueHeavy: createTokenValue('scheme-true-heavy', {
			tag: 'system',
			type: 'color',
			fallback: 'black',
		}),
	};

	return {
		labels: $labelProps,
		dynamic: $dynamicProps,
		scheme: $schemeProps,
		globals: globalProps,
		fg: makeSystemColorTokens('fg', createTokenValue),
		bg: {
			...makeSystemColorTokens('bg', createTokenValue),
			contrast: createTokenValue(`bg-contrast`, {
				tag: 'system',
				type: 'color',
				inherits: true,
			}),
		},
		borderColor: {
			'': makeSystemColorTokens('borderColor-all', createTokenValue),
			bottom: makeSystemColorTokens('borderColor-bottom', createTokenValue),
			top: makeSystemColorTokens('borderColor-top', createTokenValue),
			left: makeSystemColorTokens('borderColor-left', createTokenValue),
			right: makeSystemColorTokens('borderColor-right', createTokenValue),
		},
		ring: {
			...makeSystemColorTokens('ring', createTokenValue),
			target: createTokenValue(`ring-target`, {
				tag: 'system',
				type: 'color',
				inherits: false,
			}),
		},
		ringOffset: {
			...makeSystemColorTokens('ring-offset', createTokenValue),
			target: createTokenValue(`ring-offset-target`, {
				tag: 'system',
				type: 'color',
				inherits: false,
			}),
		},
		placeholder: makeSystemColorTokens('placeholder', createTokenValue),
		accent: makeSystemColorTokens('accent', createTokenValue),
		fill: makeSystemColorTokens('fill', createTokenValue),
		stroke: makeSystemColorTokens('stroke', createTokenValue),
		shadow: makeSystemColorTokens('shadow', createTokenValue),
	};
}

export type SystemTokens = ReturnType<typeof createSystemProps>;
