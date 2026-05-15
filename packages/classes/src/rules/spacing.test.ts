import { describe, it } from 'vitest';
import { testBaseMode } from '../_test.js';
import { testRules } from './_test.js';

describe('padding', () => {
	it('matches padding from theme', async () => {
		await testRules('p-lg', {
			padding: testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});

	it('matches literal padding values', async () => {
		await testRules('p-[10px]', {
			padding: '10px',
		});
	});

	it('supports directional rules', async () => {
		await testRules('pt-lg', {
			'padding-block-start': testBaseMode.schema.$tokens.spacing.lg.var,
		});
		await testRules('px-lg', {
			'padding-inline': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});

	it('matches directional suffixed padding values', async () => {
		await testRules('px-action', {
			'padding-inline': testBaseMode.schema.$tokens.action.padding.inline.var,
		});
		await testRules('py-action', {
			'padding-block': testBaseMode.schema.$tokens.action.padding.block.var,
		});
	});

	it('matches combined block/inline paddings from mode when using non-directional shorthand', async () => {
		await testRules('p-action', {
			padding: `${testBaseMode.schema.$tokens.action.padding.block.var} ${testBaseMode.schema.$tokens.action.padding.inline.var}`,
		});
	});
});

describe('gap', () => {
	it('matches gap from theme', async () => {
		await testRules('gap-lg', {
			gap: testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
	it('matches literal gap values', async () => {
		await testRules('gap-[10px]', {
			gap: '10px',
		});
	});
	it('matches bracketed gap values', async () => {
		await testRules('gap-[10px]', {
			gap: '10px',
		});
	});
	it('matches row-gap from theme', async () => {
		await testRules('gap-row-lg', {
			'row-gap': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
	it('matches col-gap from theme', async () => {
		await testRules('gap-col-lg', {
			'column-gap': testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});
});
