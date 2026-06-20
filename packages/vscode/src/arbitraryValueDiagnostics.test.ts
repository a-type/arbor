import { expect, it } from 'vitest';
import { findArbitraryValueWarnings } from './arbitraryValueDiagnostics.js';

it('warns on arbitrary spacing values without token usage', () => {
	const warnings = findArbitraryValueWarnings('padding: 12px;', ['--m-']);
	expect(warnings).toHaveLength(1);
	expect(warnings[0]?.message).toContain('spacing or sizing');
});

it('warns on arbitrary color values without token usage', () => {
	const warnings = findArbitraryValueWarnings('background-color: #ff0000;', [
		'--m-',
	]);
	expect(warnings).toHaveLength(1);
	expect(warnings[0]?.message).toContain('color value');
});

it('does not warn when arbor token references are present', () => {
	const warnings = findArbitraryValueWarnings(
		'padding: var(--m-spacing-small); color: var(--m-color-main-ink);',
		['--m-'],
	);
	expect(warnings).toHaveLength(0);
});

it('does not warn for allowed keyword values', () => {
	const warnings = findArbitraryValueWarnings(
		'margin: 0; color: transparent;',
		['--m-'],
	);
	expect(warnings).toHaveLength(0);
});

it('does not warn for media queries', () => {
	const warnings = findArbitraryValueWarnings(
		'@media (min-width: 600px) { ... }',
		['--m-'],
	);
	expect(warnings).toHaveLength(0);
});

it('does not warn for viewport units', () => {
	const warnings = findArbitraryValueWarnings('width: 100vw; height: 100vh;', [
		'--m-',
	]);
	expect(warnings).toHaveLength(0);
});

it('does not warn for min or max size properties', () => {
	const warnings = findArbitraryValueWarnings(
		'min-width: 500px; max-width: 1200px; min-height: 300px; max-height: 800px;',
		['--m-'],
	);
	expect(warnings).toHaveLength(0);
});
