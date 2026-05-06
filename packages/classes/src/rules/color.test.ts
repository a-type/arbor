import { $systemProps } from '@arbor-css/core';
import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { colorAlters } from '../util/alters.js';
import { testRules } from './_test.js';
import { colorRules } from './color.js';

describe('fg color', () => {
	it('matches colors from theme', async () => {
		await testRules(colorRules, 'color-main-mid', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]:
				testBaseMode.schema.$tokens.colors.main.mid.var,
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('matches literal colors', async () => {
		await testRules(colorRules, 'color-[red]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('matches bracketed colors', async () => {
		await testRules(colorRules, 'color-[rgba(255,0,0,0.5)]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'rgba(255,0,0,0.5)',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('maps color with opacity to system props', async () => {
		await testRules(colorRules, 'color-[red]/50', {
			color: `rgb(from ${$systemProps.fg.applied.var} r g b / ${$systemProps.fg.opacity.var})`,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '0.5',
		});
	});
	it('maps color without opacity to system props', async () => {
		await testRules(colorRules, 'color-[red]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('handles inherit keyword', async () => {
		await testRules(colorRules, 'color-inherit', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'unset',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('handles inherit with opacity', async () => {
		await testRules(colorRules, 'color-inherit/50', {
			color: `rgb(from ${$systemProps.fg.applied.var} r g b / ${$systemProps.fg.opacity.var})`,
			[$systemProps.fg.applied.name]: 'unset',
			[$systemProps.fg.opacity.name]: '0.5',
		});
	});
	it('handles mode theme tokens without extraneous bits', async () => {
		await testRules(colorRules, 'color-action-primary', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]:
				testBaseMode.schema.$tokens.action.primary.fg.var,
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('doesnt just toss anything in there, it only matches theme tokens if no brackets', async () => {
		await testRules(colorRules, 'color-foo', null);
	});

	describe('lighten and darken', () => {
		it('lightens a color', async () => {
			await testRules(colorRules, 'color-lighten-2', {
				color: colorAlters.lighten(
					$systemProps.fg.applied.varFallback('currentColor'),
					'2',
				),
			});
		});
		it('darkens a color', async () => {
			await testRules(colorRules, 'color-darken-2', {
				color: colorAlters.darken(
					$systemProps.fg.applied.varFallback('currentColor'),
					'2',
				),
			});
		});
	});
});

describe('bg color', () => {
	it('maps color to system props, includes contrast prop', async () => {
		await testRules(colorRules, 'bg-[red]', {
			'background-color': $systemProps.bg.applied.var,
			[$systemProps.bg.applied.name]: 'red',
			[$systemProps.bg.opacity.name]: '1',
			[$systemProps.bg.contrast.name]: 'red',
		});
	});

	it('handles nested mode tokens without suffixes', async () => {
		await testRules(colorRules, 'bg-surface-primary', {
			'background-color': $systemProps.bg.applied.var,
			[$systemProps.bg.applied.name]:
				testBaseMode.schema.$tokens.surface.primary.bg.var,
			[$systemProps.bg.opacity.name]: '1',
			[$systemProps.bg.contrast.name]:
				testBaseMode.schema.$tokens.surface.primary.bg.var,
		});
	});

	it('lightens a background color along with contrast prop', async () => {
		await testRules(colorRules, 'bg-lighten-2', {
			'background-color': colorAlters.lighten(
				$systemProps.bg.applied.varFallback('currentColor'),
				'2',
			),
			[$systemProps.bg.contrast.name]: colorAlters.lighten(
				$systemProps.bg.applied.varFallback('currentColor'),
				'2',
			),
		});
	});
});
