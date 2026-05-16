import { ArborPreset } from '@arbor-css/preset/config';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';

let config: ArborPreset<any, any> | undefined = undefined;
let styleSheet: CSSStyleSheet | undefined = undefined;

export function getConfig(): ArborPreset<any, any> {
	if (!config) {
		throw new Error(
			'Arbor configuration has not been set. Please call connect() first.',
		);
	}
	return config;
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
	config = arbor;
	// by turning off layers, we make the generated CSS take precedence over any existing pregenerated stylesheet.
	const styles = generateStylesheet(config, { layer: false });
	styleSheet = new CSSStyleSheet();
	styleSheet.replaceSync(styles);
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
}
