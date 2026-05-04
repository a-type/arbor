import { describe, it } from 'vitest';
import { testBaseMode, testRules } from './_test.js';
import { spacingRules } from './spacing.js';

describe('padding', () => {
	it('matches padding from theme', async () => {
		await testRules(spacingRules, 'p-lg', {
			padding: testBaseMode.schema.$tokens.spacing.lg.var,
		});
	});

	it('matches literal padding values', async () => {
		await testRules(spacingRules, 'p-10px', {
			padding: '10px',
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
		await testRules(spacingRules, 'gap-10px', {
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
