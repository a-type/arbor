import { expect, it } from 'vitest';
import { findFunctionParamErrors } from './functionParamDiagnostics.js';
import type { TokenMap } from './tokenProvider.js';

const FUNCTION_BRAND = '@@FUNCTION@@';
const MIXIN_BRAND = '@@MIXIN@@';

function makeTokenMap(entries: TokenMap): TokenMap {
	return entries;
}

function mockFunction(
	name: string,
	parameters: Array<{ name: string; syntax: string }>,
): any {
	return {
		[FUNCTION_BRAND]: true,
		name,
		parameters,
	};
}

function mockMixin(
	name: string,
	parameters: Array<{ name: string; syntax: string }>,
): any {
	return {
		[MIXIN_BRAND]: true,
		name,
		parameters,
		contributeTokens: {},
	};
}

const tokenMap: TokenMap = new Map([
	[
		'--fn-timing',
		mockFunction('--fn-timing', [
			{ name: '--curve', syntax: 'linear | ease | ease-in | ease-out' },
		]),
	],
	[
		'--mx-animation',
		mockMixin('--mx-animation', [
			{ name: '--name', syntax: 'slideIn | slideOut | fadeIn' },
			{ name: '--curve', syntax: 'linear | ease' },
		]),
	],
	[
		'--fn-free',
		mockFunction('--fn-free', [{ name: '--value', syntax: '<length>' }]),
	],
]);

it('reports error for invalid literal value in first parameter', () => {
	const errors = findFunctionParamErrors(
		'animation-timing-function: --fn-timing(bounce);',
		tokenMap,
	);
	expect(errors).toHaveLength(1);
	expect(errors[0]?.message).toContain('"bounce"');
	expect(errors[0]?.message).toContain('linear | ease | ease-in | ease-out');
});

it('reports no error for a valid literal value', () => {
	const errors = findFunctionParamErrors(
		'animation-timing-function: --fn-timing(ease-in);',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});

it('reports error for invalid value in second parameter', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-animation(slideIn, bounce);',
		tokenMap,
	);
	expect(errors).toHaveLength(1);
	expect(errors[0]?.message).toContain('"bounce"');
	expect(errors[0]?.message).toContain('linear | ease');
});

it('reports no errors when both parameters are valid', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-animation(slideIn, ease);',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});

it('skips validation for parameters with only CSS type syntax', () => {
	const errors = findFunctionParamErrors('color: --fn-free(12px);', tokenMap);
	expect(errors).toHaveLength(0);
});

it('skips token references (starting with --)', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-animation(--x-my-name, ease);',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});

it('skips complex expressions with parentheses', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-animation(var(--x-name), ease);',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});

it('skips unclosed (incomplete) function calls', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-animation(badValue',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});

it('returns the correct character range for the error', () => {
	const line = '@apply --mx-animation(slideIn, bounce);';
	const errors = findFunctionParamErrors(line, tokenMap);
	expect(errors).toHaveLength(1);
	const err = errors[0]!;
	expect(line.slice(err.start, err.end)).toBe('bounce');
});

it('ignores unknown functions', () => {
	const errors = findFunctionParamErrors(
		'@apply --mx-unknown(badValue);',
		tokenMap,
	);
	expect(errors).toHaveLength(0);
});
