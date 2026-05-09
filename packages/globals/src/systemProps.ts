import { createToken } from '@arbor-css/tokens';

export const $labelProps = {
	mode: createToken('ℹ️-mode', { type: 'string' }),
	scheme: createToken('ℹ️-scheme', { type: 'string' }),
};

export const $dynamicProps = {
	shadowColor: createToken('👟-shadow-color', {
		type: 'color',
		fallback: 'rgba(0, 0, 0, 0.1)',
	}),
	shadowReverse: createToken('👟-shadow-reverse', {
		type: 'number',
		fallback: 1,
	}),
};

export const $schemeProps = {
	invertMultiplier: createToken('💲-scheme-invert-mult', {
		type: 'number',
		fallback: 1,
	}),
	whenDark: createToken('💲-scheme-when-dark', {
		type: 'number',
		fallback: 0,
	}),
	whenLight: createToken('💲-scheme-when-light', {
		type: 'number',
		fallback: 1,
	}),
	trueLight: createToken('💲-scheme-true-light', {
		type: 'color',
		fallback: 'white',
	}),
	trueHeavy: createToken('💲-scheme-true-heavy', {
		type: 'color',
		fallback: 'black',
	}),
};

export const $systemProps = {
	// bookkeeping and context inference
	labels: $labelProps,
	// runtime-assignable properties
	dynamic: $dynamicProps,
	// scheme-related properties
	scheme: $schemeProps,

	// System color tokens are well-known properties you can
	// assign colors to which are used by util classes for
	// color mixing and other things...
	// TODO: move these to `classes`? Not sure they're relevant
	// outside that package.
	fg: makeSystemColorTokens('fg'),
	bg: {
		...makeSystemColorTokens('bg'),
		contrast: createToken(`💲-bg-contrast`, {
			type: 'color',
			inherits: true,
		}),
	},
	borderColor: {
		'': makeSystemColorTokens('borderColor-all'),
		block: makeSystemColorTokens('borderColor-block'),
		inline: makeSystemColorTokens('borderColor-inline'),
		'block-start': makeSystemColorTokens('borderColor-block-start'),
		'inline-end': makeSystemColorTokens('borderColor-inline-end'),
		'block-end': makeSystemColorTokens('borderColor-block-end'),
		'inline-start': makeSystemColorTokens('borderColor-inline-start'),
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
	fill: makeSystemColorTokens('fill'),
	stroke: makeSystemColorTokens('stroke'),
	shadow: makeSystemColorTokens('shadow'),
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
