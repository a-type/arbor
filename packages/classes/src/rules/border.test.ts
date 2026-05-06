import { $systemProps } from '@arbor-css/core';
import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { colorAlters } from '../util/alters.js';
import { testRules } from './_test.js';
import { borderRules } from './border.js';

describe('border color', () => {
	it('matches border colors from theme', async () => {
		await testRules(borderRules, 'b-main-mid', {
			// TODO: remove redundant fallback on "all" direction
			'border-color': $systemProps.borderColor[''].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			),
			[$systemProps.borderColor[''].applied.name]:
				testBaseMode.schema.$tokens.colors.main.mid.var,
			[$systemProps.borderColor[''].opacity.name]: '1',
		});
	});
	it('matches literal colors', async () => {
		await testRules(borderRules, 'border-[red]', {
			'border-color': $systemProps.borderColor[''].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			),
			[$systemProps.borderColor[''].applied.name]: 'red',
			[$systemProps.borderColor[''].opacity.name]: '1',
		});
	});
	it('matches bracketed colors', async () => {
		await testRules(borderRules, 'border-[rgba(255,0,0,0.5)]', {
			'border-color': $systemProps.borderColor[''].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			),
			[$systemProps.borderColor[''].applied.name]: 'rgba(255,0,0,0.5)',
			[$systemProps.borderColor[''].opacity.name]: '1',
		});
	});
	it('maps color with opacity to system props', async () => {
		await testRules(borderRules, 'border-[red]/50', {
			'border-color': `rgb(from ${$systemProps.borderColor[
				''
			].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			)} / ${$systemProps.borderColor[''].opacity.varFallback(
				$systemProps.borderColor[''].opacity.var,
			)})`,
			[$systemProps.borderColor[''].applied.name]: 'red',
			[$systemProps.borderColor[''].opacity.name]: '0.5',
		});
	});
	it('maps color without opacity to system props', async () => {
		await testRules(borderRules, 'border-[red]', {
			'border-color': $systemProps.borderColor[''].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			),
			[$systemProps.borderColor[''].applied.name]: 'red',
			[$systemProps.borderColor[''].opacity.name]: '1',
		});
	});
	it('maps literal color with opacity on directional rules', async () => {
		await testRules(borderRules, 'border-t-[red]/50', {
			'border-block-start-color': `rgb(from ${$systemProps.borderColor[
				'block-start'
			].applied.varFallback(
				$systemProps.borderColor[''].applied.var,
			)} / ${$systemProps.borderColor['block-start'].opacity.varFallback(
				$systemProps.borderColor[''].opacity.var,
			)})`,
			[$systemProps.borderColor['block-start'].applied.name]: 'red',
			[$systemProps.borderColor['block-start'].opacity.name]: '0.5',
		});
	});
	it('maps literal color without opacity on directional rules', async () => {
		await testRules(borderRules, 'border-t-[red]', {
			'border-block-start-color': $systemProps.borderColor[
				'block-start'
			].applied.varFallback($systemProps.borderColor[''].applied.var),
			[$systemProps.borderColor['block-start'].applied.name]: 'red',
			[$systemProps.borderColor['block-start'].opacity.name]: '1',
		});
	});
	it('maps color without opacity to system props on directional rules with suffixes', async () => {
		await testRules(borderRules, 'border-t-main-mid', {
			'border-block-start-color': $systemProps.borderColor[
				'block-start'
			].applied.varFallback($systemProps.borderColor[''].applied.var),
			[$systemProps.borderColor['block-start'].applied.name]:
				testBaseMode.schema.$tokens.colors.main.mid.var,
			[$systemProps.borderColor['block-start'].opacity.name]: '1',
		});
	});

	describe('lighten/darken', () => {
		it('lightens a color', async () => {
			await testRules(borderRules, 'border-lighten-2', {
				'border-color': colorAlters.lighten(
					$systemProps.borderColor[''].applied.varFallback(
						$systemProps.borderColor[''].applied.var,
					),
					'2',
				),
			});
		});
		it('darkens a color', async () => {
			await testRules(borderRules, 'border-darken-2', {
				'border-color': colorAlters.darken(
					$systemProps.borderColor[''].applied.varFallback(
						$systemProps.borderColor[''].applied.var,
					),
					'2',
				),
			});
		});
		it('lightens a directional color', async () => {
			await testRules(borderRules, 'border-t-lighten-2', {
				'border-block-start-color': colorAlters.lighten(
					$systemProps.borderColor['block-start'].applied.varFallback(
						$systemProps.borderColor[''].applied.var,
					),
					'2',
				),
			});
		});
	});
});

describe('border width', () => {
	it('matches border widths from theme', async () => {
		await testRules(borderRules, 'b-t-lg', {
			'border-block-start-width':
				testBaseMode.schema.$tokens.borderWidth.lg.var,
		});
	});
});

describe('border style', () => {
	it('matches border styles', async () => {
		await testRules(borderRules, 'border-dashed', {
			'border-style': 'dashed',
		});
	});
});

describe('border radius', () => {
	it('matches border radii from theme', async () => {
		await testRules(borderRules, 'rd-md', {
			'border-radius': testBaseMode.schema.$tokens.borderRadius.md.var,
		});
	});
});
