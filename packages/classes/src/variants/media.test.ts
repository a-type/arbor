import { describe, it } from 'vitest';
import { testVariants } from './_test.js';
import {
	variantContrasts,
	variantCustomMedia,
	variantForcedColors,
	variantMotions,
	variantNoscript,
	variantOrientations,
	variantPrint,
	variantScripting,
} from './media.js';

describe('media variants', () => {
	it('applies noscript media query', async () => {
		await testVariants([variantNoscript], 'noscript:bg-red', 'bg-red', {
			parent: '@media (scripting: none)',
		});
	});

	it('applies scripting media query', async () => {
		await testVariants([variantScripting], 'script-enabled:bg-red', 'bg-red', {
			parent: '@media (scripting: enabled)',
		});
	});

	it('applies print media query', async () => {
		await testVariants([variantPrint], 'print:bg-red', 'bg-red', {
			parent: '@media print',
		});
	});

	it('applies custom media query', async () => {
		await testVariants(
			[variantCustomMedia],
			'media-[screen and (min-width: 600px)]:bg-red',
			'bg-red',
			{
				parent: '@media screen and (min-width: 600px)',
			},
		);
	});

	it('applies contrast media query', async () => {
		await testVariants(variantContrasts, 'contrast-more:bg-red', 'bg-red', {
			parent: '@media (prefers-contrast: more)',
		});
	});

	it('applies motion media query', async () => {
		await testVariants(variantMotions, 'motion-reduce:bg-red', 'bg-red', {
			parent: '@media (prefers-reduced-motion: reduce)',
		});
	});

	it('applies orientation media query', async () => {
		await testVariants(variantOrientations, 'landscape:bg-red', 'bg-red', {
			parent: '@media (orientation: landscape)',
		});
	});

	it('applies forced-colors media query', async () => {
		await testVariants(variantForcedColors, 'forced-colors:bg-red', 'bg-red', {
			parent: '@media (forced-colors: active)',
		});
	});
});
