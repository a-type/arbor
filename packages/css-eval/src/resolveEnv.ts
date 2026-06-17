import { Css } from './interpolation.js';

export interface CssEnvValues {
	deviceWidthPx?: number;
	deviceHeightPx?: number;
	remPx?: number;
}

export function resolveEnv(
	css: Css,
	{ deviceHeightPx, deviceWidthPx, remPx }: CssEnvValues,
): Css {
	let text = css.text;
	if (deviceWidthPx) {
		text = text.replace(
			/([\d.]+)[dls]?v[wi]/g,
			(_, num) => `${(parseFloat(num) / 100) * deviceWidthPx}px`,
		);
	}
	if (deviceHeightPx) {
		text = text.replace(
			/([\d.]+)[dls]?v[hb]/g,
			(_, num) => `${(parseFloat(num) / 100) * deviceHeightPx}px`,
		);
	}
	if (deviceWidthPx && deviceHeightPx) {
		text = text.replace(/([\d.]+)[dls]?vmin/g, (_, num) => {
			const vmin = Math.min(deviceWidthPx, deviceHeightPx);
			return `${(parseFloat(num) / 100) * vmin}px`;
		});
		text = text.replace(/([\d.]+)[dls]?vmax/g, (_, num) => {
			const vmax = Math.max(deviceWidthPx, deviceHeightPx);
			return `${(parseFloat(num) / 100) * vmax}px`;
		});
	}
	if (remPx) {
		text = text.replace(
			/([\d.]+)rem/g,
			(_, num) => `${parseFloat(num) * remPx}px`,
		);
	}
	return { ...css, text };
}
