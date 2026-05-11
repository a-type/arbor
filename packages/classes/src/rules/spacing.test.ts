import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { testRules } from './_test.js';
import { spacingRules } from './spacing.js';

describe('padding', () => {
	it('matches padding from theme', async () => {
		await testRules(spacingRules, 'p-lg', {
			padding: testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});

	it('matches literal padding values', async () => {
		await testRules(spacingRules, 'p-[10px]', {
			padding: '10px',
		});
	});

	it('supports directional rules', async () => {
		await testRules(spacingRules, 'pt-lg', {
			'padding-block-start': testBaseMode.schema.$tokens.spacing.lg.var,
		});
		await testRules(spacingRules, 'px-lg', {
			'padding-inline': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});

	it('matches directional suffixed padding values', async () => {
		await testRules(spacingRules, 'px-action', {
			'padding-inline': testBaseMode.schema.$tokens.action.padding.inline.var,
		});
		await testRules(spacingRules, 'py-action', {
			'padding-block': testBaseMode.schema.$tokens.action.padding.block.var,
		});
	});
});

describe('gap', () => {
	it('matches gap from theme', async () => {
		await testRules(spacingRules, 'gap-lg', {
			gap: testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
	it('matches literal gap values', async () => {
		await testRules(spacingRules, 'gap-[10px]', {
			gap: '10px',
		});
	});
	it('matches bracketed gap values', async () => {
		await testRules(spacingRules, 'gap-[10px]', {
			gap: '10px',
		});
	});
	it('matches row-gap from theme', async () => {
		await testRules(spacingRules, 'gap-row-lg', {
			'row-gap': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
	it('matches col-gap from theme', async () => {
		await testRules(spacingRules, 'gap-col-lg', {
			'column-gap': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
});
