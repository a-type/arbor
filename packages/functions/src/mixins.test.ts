import { css, isCss, printCss } from '@arbor-css/css-eval';
import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import { createFunctionFactory } from './functions.js';
import { createMixinFactory, isMixin } from './mixins.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });
const createMixin = createMixinFactory({
	namePrefix: '--x-mixin-',
	createToken,
});

describe('createMixin', () => {
	it('sets the CSS name with -- prefix', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => css`
				box-shadow: none;
			`,
		});

		expect(mixin.name).toBe('--x-mixin-shadow');
	});

	it('stores description and declarations', () => {
		const mixin = createMixin('shadow', {
			description: 'Applies stacked shadow variables',
			definition: (css) => css`
				--x-system-shadow: 0 0 0 0 transparent;
				--x-system-ring: 0 0 0 0 transparent;
				box-shadow: var(--x-system-ring), var(--x-system-shadow);
			`,
		});

		expect(mixin.description).toBe('Applies stacked shadow variables');
		expect(isCss(mixin.body)).toBe(true);
		expect(mixin.body.type).toBe('stylesheet');
	});

	it('generates a CSS @mixin definition', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => css`
				--x-system-shadow: 0 0 0 0 transparent;
				--x-system-ring: 0 0 0 0 transparent;
				box-shadow: var(--x-system-ring), var(--x-system-shadow);
			`,
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 transparent; box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});

	it('supports scoped declarations', () => {
		const mixin = createMixin('responsive-bg', {
			definition: () => css`
				@media (max-width: 400px) {
					background: red;
				}

				.parent {
					color: blue;
				}
			`,
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-responsive-bg { @media (max-width: 400px) { background: red; } .parent { color: blue; } }',
		);
	});

	it('supports nested scoped declarations', () => {
		const mixin = createMixin('complex', {
			definition: () => css`
				.parent {
					color: blue;
					&:hover {
						color: red;
					}
				}
			`,
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-complex { .parent { color: blue; &:hover { color: red; } } }',
		);
	});

	it('supports parameters in definitions', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'] as const,
			definition: (css, { parameters: [defaultRingColor] }) => css`
				--x-system-shadow: 0 0 0 0 transparent;
				--x-system-ring: 0 0 0 0 ${defaultRingColor};
				box-shadow: var(--x-system-ring), var(--x-system-shadow);
			`,
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow(--_-param-shadow-default-ring-color) { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 var(--_-param-shadow-default-ring-color); box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});

	it('supports contributing tokens', () => {
		const mixin = createMixin('colored-shadow', {
			definition: (css, { tokens: { token } }) => css`
				--x-colored-shadow: 0 0 0 0 ${token};
			`,
			contributeTokens: { token: 'color' },
		});

		expect(mixin.contributeTokens.token.name).toBe(`--x-colored-shadow-token`);
		expect(mixin.definition).toBe(
			`@mixin --x-mixin-colored-shadow { --x-colored-shadow: 0 0 0 0 ${mixin.contributeTokens.token.var}; }`,
		);
	});

	it('handles very complex cases', () => {
		const externalTokens = {
			bg: createToken('bg'),
			bgFallback: createToken('bgFallback'),
			fg: createToken('fg'),
			fgFallback: createToken('fgFallback'),
		};

		const mixin = createMixin('arrow', {
			definition: (css, { tokens }) => css`
				fill: ${[externalTokens.bg, externalTokens.bgFallback]};
				stroke: ${[externalTokens.fg, externalTokens.fgFallback]};
				width: ${tokens.size};
				height: calc(${tokens.size} / 2);
				position: relative;
				z-index: 0;
				transform: translate(0, 0) rotate(var(--angle, 0deg))
					scale(var(--scale, 1));

				&[data-side='top']: {
					--angle: rotate(0deg);
					bottom: calc(-1 * ${tokens.size} / 2 + 1px);
				}
				&[data-side='right']: {
					--angle: rotate(90deg);
					left: calc(-1 * ${tokens.size} * 0.75);
				}
				&[data-side='bottom']: {
					--angle: rotate(180deg);
					top: calc(-1 * ${tokens.size} / 2);
				}
				&[data-side='left']: {
					--angle: rotate(270deg);
					left: calc(-1 * ${tokens.size} * 0.75);
				}

				&[data-open]: {
					opacity: 1;
					--scale: 1;
				}
				&[data-closed]: {
					opacity: 0;
					--scale: 0;
				}
			`,
			contributeTokens: {
				size: 'size',
			},
		});

		expect(mixin.contributeTokens.size.name).toBe(`--x-arrow-size`);
		expect(mixin.definition).toMatchInlineSnapshot(
			`"@mixin --x-mixin-arrow { fill: var(--x-bg, var(--x-bgFallback)); stroke: var(--x-fg, var(--x-fgFallback)); width: var(--x-arrow-size); height: calc(var(--x-arrow-size) / 2); position: relative; z-index: 0; transform: translate(0, 0) rotate(var(--angle, 0deg)) scale(var(--scale, 1)); &[data-side='top']: { --angle: rotate(0deg); bottom: calc(-1 * var(--x-arrow-size) / 2 + 1px); } &[data-side='right']: { --angle: rotate(90deg); left: calc(-1 * var(--x-arrow-size) * 0.75); } &[data-side='bottom']: { --angle: rotate(180deg); top: calc(-1 * var(--x-arrow-size) / 2); } &[data-side='left']: { --angle: rotate(270deg); left: calc(-1 * var(--x-arrow-size) * 0.75); } &[data-open]: { opacity: 1; --scale: 1; } &[data-closed]: { opacity: 0; --scale: 0; } }"`,
		);
	});

	it('should allow applying the mixin with parameters', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'],
			definition: (css, { parameters: [defaultRingColor] }) => css`
				--x-system-shadow: 0 0 0 0 transparent;
				--x-system-ring: 0 0 0 0 ${defaultRingColor};
				box-shadow: var(--x-system-ring), var(--x-system-shadow);
			`,
		});

		const result = mixin.apply({ '--default-ring-color': 'red' });
		// apply() now returns a CssStylesheet fragment
		expect(result.type).toBe('stylesheet');
		// Verify the printed output includes the parameter assignment + body
		expect(printCss(result)).toContain(
			`${mixin.parameterTokens[0].name}: red;`,
		);
	});

	it('should allow applying the mixin with tokens', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'],
			definition: (css, { parameters: [defaultRingColor] }) => css`
				--x-system-shadow: 0 0 0 0 transparent;
				--x-system-ring: 0 0 0 0 ${defaultRingColor};
				box-shadow: var(--x-system-ring), var(--x-system-shadow);
			`,
		});

		const token = createToken('my-color');
		const result = mixin.apply({ '--default-ring-color': token });
		// apply() now returns a CssStylesheet fragment
		expect(result.type).toBe('stylesheet');
		// The parameter declaration should use the token's var()
		expect(printCss(result)).toContain(
			`${mixin.parameterTokens[0].name}: ${token.var};`,
		);
	});

	it('should not require optional parameters in apply typings', () => {
		const mixin = createMixin('test', {
			parameters: [
				'--required',
				{ name: '--optional', fallback: 'red' },
			] as const,
			definition: (css, { parameters: [required, optional] }) => css`
				color: ${required} var(${optional});
			`,
		});

		mixin.apply({ '--required': 'blue', '--optional': undefined });
		mixin.apply({ '--required': 'blue', '--optional': 'green' });
		// @ts-expect-error
		mixin.apply({});
	});

	it('should compose multiple mixins', () => {
		const mixinA = createMixin('a', {
			definition: (css) => css`
				color: red;
			`,
		});

		const mixinB = createMixin('b', {
			definition: (css) => css`
				${mixinA.apply({})}
				background: blue;
			`,
		});

		// mixinB.apply() returns a CssStylesheet with the body of A + background
		const result = mixinB.apply({});
		expect(result.type).toBe('stylesheet');
		expect(printCss(result)).toBe('color: red; background: blue;');
	});

	it('should handle composing multiple mixins with the same param names', () => {
		const mixinA = createMixin('a', {
			parameters: ['--color'] as const,
			definition: (css, { parameters: [color] }) => css`
				color: ${color};
			`,
		});

		const mixinB = createMixin('b', {
			parameters: ['--color'] as const,
			definition: (css, { parameters: [color] }) => css`
				${mixinA.apply({ '--color': 'green' })}
				background: ${color};
			`,
		});

		const mixed = createMixin('mixed', {
			parameters: ['--color'] as const,
			definition: (css, { parameters: [color] }) => css`
				${mixinB.apply({ '--color': color })}
			`,
		});

		expect(mixed.definition).toMatchInlineSnapshot(
			`"@mixin --x-mixin-mixed(--_-param-mixed-color) { --_-param-b-color: var(--_-param-mixed-color); --_-param-a-color: green; color: var(--_-param-a-color); background: var(--_-param-b-color); }"`,
		);
	});

	it('should compose function calls', () => {
		const functionA = createFunctionFactory()('a', {
			parameters: ['--color'] as const,
			definition: (css, color) => css`
				rgb(${color} / 0.5)
			`,
		});
		const mixinA = createMixin('a', {
			parameters: ['--color'] as const,
			definition: (css, { parameters: [color] }) => css`
				color: ${functionA.compute({ '--color': color })};
			`,
		});

		const result = mixinA.apply({ '--color': 'red' });
		expect(result.type).toBe('stylesheet');
		expect(printCss(result)).toBe(
			'--_-param-a-color: red; color: rgb(var(--_-param-a-color) / 0.5);',
		);
	});
});

describe('isMixin', () => {
	it('returns true for a created mixin', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => css`
				box-shadow: none;
			`,
		});

		expect(isMixin(mixin)).toBe(true);
	});

	it('returns false for non-mixin values', () => {
		expect(isMixin(null)).toBe(false);
		expect(isMixin(undefined)).toBe(false);
		expect(isMixin(42)).toBe(false);
		expect(isMixin({ name: '--test' })).toBe(false);
	});
});
