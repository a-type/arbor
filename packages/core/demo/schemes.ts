import { createColorRange, createScheme } from '@arbor-css/colors';

export const contrastScheme = createScheme({
	tag: '💟',
	isDark: false,
	getColorRange: (config) =>
		createColorRange(config, {
			lightness: ($, { step, rangeSize }) => {
				return $.literal(step > Math.ceil(rangeSize / 4) ? '1' : '0');
			},
			chroma: ($, { step, rangeSize }) =>
				$.multiply($.literal('0.1'), $.literal(rangeSize - step)),
		}),
});
