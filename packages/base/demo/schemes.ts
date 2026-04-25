import { createColorRange, createScheme } from '../src/index.js';

export const contrastScheme = createScheme({
	tag: '💟',
	getColorRange: ({ sourceHue, context, rangeNames }) =>
		createColorRange({
			sourceHue,
			context,
			lightness: ($, { step, rangeSize }) => {
				if (step === Math.ceil(rangeSize / 4)) {
					return $.literal('0.5');
				}
				return $.literal(step > Math.ceil(rangeSize / 4) ? '1' : '0');
			},
			chroma: ($, { step, rangeSize }) =>
				$.multiply($.literal('0.1'), $.literal(rangeSize - step)),
			rangeNames,
		}),
});
