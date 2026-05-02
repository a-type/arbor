import { ArborConfig } from '../config.js';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';

let config: ArborConfig<any> | undefined = undefined;
let styleSheet: CSSStyleSheet | undefined = undefined;

export function getConfig(): ArborConfig<any> {
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

export function connect(arbor: ArborConfig<any>) {
	config = arbor;
	const styles = generateStylesheet(config);
	styleSheet = new CSSStyleSheet();
	styleSheet.replaceSync(styles);
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
}
