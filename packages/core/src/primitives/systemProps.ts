import { createToken } from '@arbor-css/tokens';

export const $systemProps = {
	fg: makeSystemColorTokens('fg'),
	bg: makeSystemColorTokens('bg'),
	borderColor: {
		all: makeSystemColorTokens('borderColor-all'),
		top: makeSystemColorTokens('borderColor-top'),
		right: makeSystemColorTokens('borderColor-right'),
		bottom: makeSystemColorTokens('borderColor-bottom'),
		left: makeSystemColorTokens('borderColor-left'),
	},
	ring: {
		...makeSystemColorTokens('ring'),
		target: createToken(`💲-ring-target`, {
			type: 'color',
			inherits: false,
		}),
	},
	placeholder: makeSystemColorTokens('placeholder'),
	accent: makeSystemColorTokens('accent'),
};

function makeSystemColorTokens(name: string) {
	return {
		applied: createToken(`💲-${name}`, {
			type: 'color',
			inherits: true,
		}),
		opacity: createToken(`💲-${name}-op`, {
			type: 'number',
			inherits: false,
			fallback: '100%',
		}),
	};
}
