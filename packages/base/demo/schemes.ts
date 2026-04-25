import { createColorRangeCustom, createScheme } from '../src/index.js';

export const contrastScheme = createScheme({
	tag: '💟',
	getColorRange: ({ sourceHue, context }) =>
		createColorRangeCustom({
			sourceHue,
			context,
			lightness: ($, { step, rangeSize }) =>
				$.literal(step > Math.round(rangeSize / 3) ? '1' : '0'),
			chroma: ($) => $.literal('0.1'),
		}),
});
