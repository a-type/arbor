import { getContrastColor } from '@arbor-css/colors';
import { isToken } from '@arbor-css/tokens';
import { getConfig } from '../registration.js';

class ColorRange extends HTMLElement {
	constructor() {
		super();

		const colorName = this.getAttribute('color');
		if (!colorName) {
			throw new Error('ColorRange component requires a "color" attribute.');
		}

		const config = getConfig();
		const colorRange = config.primitives.$tokens.colors[colorName];
		if (!colorRange) {
			throw new Error(`Color "${colorName}" not found in configuration.`);
		}

		if (isToken(colorRange)) {
			throw new Error(
				`Color "${colorName}" is not a valid color range (it's an individual token)`,
			);
		}

		this.attachShadow({ mode: 'closed' }).innerHTML = `
			<div class="range-wrapper">
				<h2>${colorName}</h2>
				<div class="range">
					${Object.keys(colorRange)
						.map((key) => {
							const color = colorRange[key as keyof typeof colorRange];
							if (!isToken(color)) {
								// ignore
								return '';
							}
							const value = color.var;
							return `<div class="color" style="background-color: ${value}; color: ${getContrastColor(value)}">
								<div>${key}</div>
							</div>`;
						})
						.join('\n')}
				</div>
			</div>
			<style>
				.range {
					display: flex;
				}
				.color {
					flex: 1;
					text-align: center;
					padding: 1rem;
				}
			</style>
		`;
	}
}

customElements.define('arbor-color-range', ColorRange);
