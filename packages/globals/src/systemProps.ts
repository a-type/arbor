import { createToken } from '@arbor-css/tokens';

export const $labelProps = {
	mode: createToken('ℹ️-mode', { type: 'string' }),
	scheme: createToken('ℹ️-scheme', { type: 'string' }),
};

export const $dynamicProps = {
	shadowColor: createToken('👟-shadowColor', {
		type: 'color',
		fallback: 'rgba(0, 0, 0, 0.1)',
	}),
};

export const $systemProps = {
	// bookkeeping and context inference
	labels: $labelProps,
	// runtime-assignable properties
	dynamic: $dynamicProps,
	// System color tokens are well-known properties you can
	// assign colors to which are used by util classes for
	// color mixing and other things...
	// TODO: move these to `classes`? Not sure they're relevant
	// outside that package.
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
