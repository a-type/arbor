import { ArborPreset } from '@arbor-css/preset/config';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';
import register from './components/index.js';

let preset: ArborPreset<any, any> | undefined = undefined;
let styleSheet: CSSStyleSheet | undefined = undefined;
let resolve: () => void = () => {};
export const ready = new Promise<void>((res) => (resolve = res));

export function getPreset(): ArborPreset {
	if (!preset) {
		throw new Error(
			'Arbor configuration has not been set. Please call connect() first.',
		);
	}
	return preset;
}

export function getStyleSheet(): CSSStyleSheet {
	if (!styleSheet) {
		throw new Error(
			'Arbor stylesheet has not been generated. Please call connect() first.',
		);
	}
	return styleSheet;
}

export function connect(arbor: ArborPreset<any, any>) {
	preset = arbor;
	// by turning off layers, we make the generated CSS take precedence over any existing pregenerated stylesheet.
	const styles = generateStylesheet(preset, { layer: false });
	styleSheet = new CSSStyleSheet();
	styleSheet.replaceSync(styles);
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
	resolve();
	register();
}
