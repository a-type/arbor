import { css, printEquation } from '@arbor-css/calc';
import { createTokenFactory } from '@arbor-css/tokens';
import { describe, expect, it } from 'vitest';
import {
	createMixinFactory,
	isMixin,
	isMixinPropertyDeclaration,
} from './mixins.js';

const createToken = createTokenFactory({ tokenPrefix: '--x-' });
const createMixin = createMixinFactory({
	namePrefix: '--x-mixin-',
	createToken,
});

describe('createMixin', () => {
	it('sets the CSS name with -- prefix', () => {
		const mixin = createMixin('shadow', {
			definition: () => [],
		});

		expect(mixin.name).toBe('--x-mixin-shadow');
	});

	it('stores description and declarations', () => {
		const mixin = createMixin('shadow', {
			description: 'Applies stacked shadow variables',
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: 'box-shadow',
					value: css`var(--x-system-ring), var(--x-system-shadow)`,
				},
			],
		});

		expect(mixin.description).toBe('Applies stacked shadow variables');
		expect(mixin.body).toHaveLength(2);
	});

	it('generates a CSS @mixin definition', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: '--x-system-ring',
					value: css`0 0 0 0 transparent`,
				},
				{
					prop: 'box-shadow',
					value: css`var(--x-system-ring), var(--x-system-shadow)`,
				},
			],
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 transparent; box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});

	it('supports object definitions', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => ({
				'--x-system-shadow': css`0 0 0 0 transparent`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		expect(
			mixin.body.filter(isMixinPropertyDeclaration).map((decl) => decl.prop),
		).toEqual(['--x-system-shadow', 'box-shadow']);
	});

	it('supports scoped declarations in object definitions', () => {
		const mixin = createMixin('responsive-bg', {
			definition: () => ({
				'@media (max-width: 400px)': {
					background: 'red',
				},
				'.parent': {
					color: 'blue',
				},
			}),
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-responsive-bg { @media (max-width: 400px) { background: red; } .parent { color: blue; } }',
		);
		expect(mixin.body).toEqual([
			{
				scope: '@media (max-width: 400px)',
				children: [{ prop: 'background', value: css`red` }],
			},
			{
				scope: '.parent',
				children: [{ prop: 'color', value: css`blue` }],
			},
		]);
	});

	it('supports scoped declarations in list definitions', () => {
		const mixin = createMixin('responsive-fg', {
			definition: () => [
				{ prop: 'color', value: 'blue' },
				{
					scope: '@media (max-width: 400px)',
					children: [
						{ prop: 'color', value: 'red' },
						{ prop: 'background', value: 'black' },
					],
				},
			],
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-responsive-fg { color: blue; @media (max-width: 400px) { color: red; background: black; } }',
		);
	});

	it('returns inlinable declarations', () => {
		const mixin = createMixin('shadow', {
			definition: (css) => [
				{
					prop: '--x-system-shadow',
					value: css`
						${'0 0 0 0 transparent'}
					`,
				},
			],
		});

		expect(
			mixin.body.filter(isMixinPropertyDeclaration).map((decl) => ({
				prop: decl.prop,
				value: printEquation(decl.value),
			})),
		).toEqual([{ prop: '--x-system-shadow', value: '0 0 0 0 transparent' }]);
	});

	it('supports parameters in definitions', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'] as const,
			definition: (css, { parameters: [defaultRingColor] }) => ({
				'--x-system-shadow': css` 0 0 0 0 transparent`,
				'--x-system-ring': css`0 0 0 0 ${defaultRingColor}`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		expect(mixin.definition).toBe(
			'@mixin --x-mixin-shadow(--default-ring-color) { --x-system-shadow: 0 0 0 0 transparent; --x-system-ring: 0 0 0 0 var(--default-ring-color); box-shadow: var(--x-system-ring), var(--x-system-shadow); }',
		);
	});

	it('supports contributing tokens', () => {
		const mixin = createMixin('colored-shadow', {
			definition: (css, { tokens: { token } }) => ({
				'--x-colored-shadow': css`0 0 0 0 ${token}`,
			}),
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
			definition: (css, { tokens }) => ({
				fill: css`
					${[externalTokens.bg, externalTokens.bgFallback]}
				`,
				stroke: css`
					${[externalTokens.fg, externalTokens.fgFallback]}
				`,
				width: tokens.size,
				height: css`calc(${tokens.size} / 2)`,
				position: 'relative',
				'z-index': 0,
				transform:
					'translate(0, 0) rotate(var(--angle, 0deg)) scale(var(--scale, 1))',

				'&[data-side="top"]': {
					'--angle': 'rotate(0deg)',
					bottom: css`calc(-1 * ${tokens.size} / 2 + 1px)`,
				},
				'&[data-side="right"]': {
					'--angle': 'rotate(90deg)',
					left: css`calc(-1 * ${tokens.size} * 0.75)`,
				},
				'&[data-side="bottom"]': {
					'--angle': 'rotate(180deg)',
					top: css`calc(-1 * ${tokens.size} / 2)`,
				},
				'&[data-side="left"]': {
					'--angle': 'rotate(270deg)',
					left: css`calc(-1 * ${tokens.size} * 0.75)`,
				},

				'&[data-open]': {
					opacity: 1,
					'--scale': 1,
				},
				'&[data-closed]': {
					opacity: 0,
					'--scale': 0,
				},
			}),
			contributeTokens: {
				size: 'size',
			},
		});

		expect(mixin.contributeTokens.size.name).toBe(`--x-arrow-size`);
		expect(mixin.definition).toMatchInlineSnapshot(
			`"@mixin --x-mixin-arrow { fill: var(--x-bg, var(--x-bgFallback)); stroke: var(--x-fg, var(--x-fgFallback)); width: var(--x-arrow-size); height: calc((var(--x-arrow-size) / 2)); position: relative; z-index: 0; transform: translate(0, 0) rotate(var(--angle, 0deg)) scale(var(--scale, 1)); &[data-side="top"] { --angle: rotate(0deg); bottom: calc((((-1 * var(--x-arrow-size)) / 2) + 1px)); } &[data-side="right"] { --angle: rotate(90deg); left: calc(((-1 * var(--x-arrow-size)) * 0.75)); } &[data-side="bottom"] { --angle: rotate(180deg); top: calc(((-1 * var(--x-arrow-size)) / 2)); } &[data-side="left"] { --angle: rotate(270deg); left: calc(((-1 * var(--x-arrow-size)) * 0.75)); } &[data-open] { opacity: 1; --scale: 1; } &[data-closed] { opacity: 0; --scale: 0; } }"`,
		);
	});

	it('should allow applying the mixin with parameters', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'],
			definition: (css, { parameters: [defaultRingColor] }) => ({
				'--x-system-shadow': css`0 0 0 0 transparent`,
				'--x-system-ring': css`0 0 0 0 ${defaultRingColor}`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		const result = mixin.apply(['red']);
		expect(result).toEqual([
			{ prop: mixin.parameters[0], value: css`red` },
			...mixin.body,
		]);
	});

	it('should allow applying the mixin with tokens', () => {
		const mixin = createMixin('shadow', {
			parameters: ['--default-ring-color'],
			definition: (css, { parameters: [defaultRingColor] }) => ({
				'--x-system-shadow': css`0 0 0 0 transparent`,
				'--x-system-ring': css`0 0 0 0 ${defaultRingColor}`,
				'box-shadow': css`var(--x-system-ring), var(--x-system-shadow)`,
			}),
		});

		const token = createToken('my-color');
		const result = mixin.apply([token]);
		expect(result).toEqual([
			{
				prop: mixin.parameters[0],
				value: css`
					${token}
				`,
			},
			...mixin.body,
		]);
	});

	it('should not require optional parameters in apply typings', () => {
		const mixin = createMixin('test', {
			parameters: [
				'--required',
				{ name: '--optional', fallback: 'red' },
			] as const,
			definition: (css, { parameters: [required, optional] }) => ({
				color: css`
					${required} var(${optional})
				`,
			}),
		});

		mixin.apply(['blue', undefined]);
		mixin.apply(['blue', 'green']);
		// @ts-expect-error
		mixin.apply([]);
	});
});

describe('isMixin', () => {
	it('returns true for a created mixin', () => {
		const mixin = createMixin('shadow', {
			definition: () => [],
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
