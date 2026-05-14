import { $systemProps } from '@arbor-css/core';
import { describe, expect, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { colorAlters } from '../util/alters.js';
import { testRules } from './_test.js';
import { colorRules } from './color.js';

describe('fg color', () => {
	it('matches colors from theme', async () => {
		await testRules('color-main-mid', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: expect.stringContaining(
				testBaseMode.schema.$tokens.colors.main.mid.var,
			),
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('matches literal colors', async () => {
		await testRules('color-[red]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('matches bracketed colors', async () => {
		await testRules('color-[rgba(255,0,0,0.5)]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'rgba(255,0,0,0.5)',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('maps color with opacity to system props', async () => {
		await testRules('color-[red]/50', {
			color: `rgb(from ${$systemProps.fg.applied.var} r g b / ${$systemProps.fg.opacity.var})`,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '0.5',
		});
	});
	it('maps color without opacity to system props', async () => {
		await testRules('color-[red]', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'red',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('handles inherit keyword', async () => {
		await testRules('color-inherit', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: 'unset',
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('handles inherit with opacity', async () => {
		await testRules('color-inherit/50', {
			color: `rgb(from ${$systemProps.fg.applied.var} r g b / ${$systemProps.fg.opacity.var})`,
			[$systemProps.fg.applied.name]: 'unset',
			[$systemProps.fg.opacity.name]: '0.5',
		});
	});
	it('handles mode theme tokens without extraneous bits', async () => {
		await testRules('color-action-primary', {
			color: $systemProps.fg.applied.var,
			[$systemProps.fg.applied.name]: expect.stringContaining(
				testBaseMode.schema.$tokens.action.primary.color.fg.var,
			),
			[$systemProps.fg.opacity.name]: '1',
		});
	});
	it('doesnt just toss anything in there, it only matches theme tokens if no brackets', async () => {
		await testRules('color-foo', null, colorRules);
	});

	describe('lighten and darken', () => {
		it('lightens a color', async () => {
			await testRules('color-lighten-2', {
				color: colorAlters.lighten(
					$systemProps.fg.applied.varFallback('currentColor'),
					'2',
				),
			});
		});
		it('darkens a color', async () => {
			await testRules('color-darken-2', {
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
		await testRules('bg-[red]', {
			'background-color': $systemProps.bg.applied.var,
			[$systemProps.bg.applied.name]: 'red',
			[$systemProps.bg.opacity.name]: '1',
			[$systemProps.bg.contrast.name]: 'red',
		});
	});

	it('copies other color targets', async () => {
		await testRules('bg-fg', {
			'background-color': $systemProps.bg.applied.var,
			[$systemProps.bg.applied.name]: $systemProps.fg.applied.var,
			[$systemProps.bg.opacity.name]: '1',
			[$systemProps.bg.contrast.name]: $systemProps.fg.applied.var,
		});
	});

	it('handles nested mode tokens without suffixes', async () => {
		await testRules('bg-surface-primary', {
			'background-color': $systemProps.bg.applied.var,
			[$systemProps.bg.applied.name]: expect.stringContaining(
				testBaseMode.schema.$tokens.surface.primary.color.bg.var,
			),
			[$systemProps.bg.opacity.name]: '1',
			[$systemProps.bg.contrast.name]:
				testBaseMode.schema.$tokens.surface.primary.color.bg.var,
		});
	});

	it('lightens a background color along with contrast prop', async () => {
		await testRules('bg-lighten-2', {
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

describe('ring color', () => {
	it('copies other color targets', async () => {
		await testRules('ring-bg', {
			[$systemProps.ring.target.name]: $systemProps.ring.applied.var,
			[$systemProps.ring.applied.name]: $systemProps.bg.applied.var,
			[$systemProps.ring.opacity.name]: '1',
		});
	});
});
