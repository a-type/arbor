import { ArborConfig } from '../config.js';
import { generateStylesheet } from '../stylesheet/generateStylesheet.js';

let config: ArborConfig<any> | undefined = undefined;

export function getConfig(): ArborConfig<any> {
	if (!config) {
		throw new Error(
			'Arbor configuration has not been set. Please call connect() first.',
		);
	}
	return config;
}

export function connect(arbor: ArborConfig<any>) {
	config = arbor;
	const styles = generateStylesheet(config);
	const styleEl = document.createElement('style');
	styleEl.textContent = styles;
	document.head.appendChild(styleEl);
}
