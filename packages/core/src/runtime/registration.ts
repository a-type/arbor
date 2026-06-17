import {
	CssEnvValues,
	CssResolutionContext,
	CssSimplifier,
} from '@arbor-css/css-eval';
import { loadSimplifier } from '@arbor-css/css-eval/browser';
import { ArborPreset } from '@arbor-css/preset/config';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';
import register from './components/index.js';

let preset: ArborPreset<any, any> | undefined = undefined;
let styleSheet: CSSStyleSheet | undefined = undefined;
let resolve: () => void = () => {};
export const ready = new Promise<void>((res) => (resolve = res));
let simplifier: CssSimplifier;

export function getPreset(): ArborPreset {
	if (!preset) {
		throw new Error(
			'Arbor configuration has not been set. Please call connect() first.',
		);
	}
	return preset;
}

export function getEnvValues(): CssEnvValues {
	const vw = window.visualViewport?.width ?? window.innerWidth;
	const vh = window.visualViewport?.height ?? window.innerHeight;
	const rootFontSize = getComputedStyle(document.documentElement).fontSize;
	const rem =
		rootFontSize.includes('px') ? parseFloat(rootFontSize) : undefined;
	return {
		deviceWidthPx: vw,
		deviceHeightPx: vh,
		remPx: rem,
	};
}

export function getContext(): CssResolutionContext {
	if (!simplifier) {
		throw new Error(
			'Arbor CSS simplifier has not been initialized. Please call connect() first.',
		);
	}
	return {
		simplifier,
		envValues: getEnvValues(),
	};
}

export function subscribeToEnvChanges(callback: () => void) {
	window.addEventListener('resize', callback);
	window.visualViewport?.addEventListener('resize', callback);
	return () => {
		window.removeEventListener('resize', callback);
		window.visualViewport?.removeEventListener('resize', callback);
	};
}

export function getStyleSheet(): CSSStyleSheet {
	if (!styleSheet) {
		throw new Error(
			'Arbor stylesheet has not been generated. Please call connect() first.',
		);
	}
	return styleSheet;
}

export async function connect(arbor: ArborPreset<any, any>) {
	preset = arbor;
	simplifier = await loadSimplifier({ passes: 2 });
	// by turning off layers, we make the generated CSS take precedence over any existing pregenerated stylesheet.
	const styles = generateStylesheet(preset, { layer: false });
	styleSheet = new CSSStyleSheet();
	styleSheet.replaceSync(styles);
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
	resolve();
	register();
}
