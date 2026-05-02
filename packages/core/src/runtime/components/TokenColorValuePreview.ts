import { ArborElement } from './BaseElement.js';

class TokenColorValuePreview extends ArborElement {
	constructor() {
		super();
		const color = this.getAttribute('color') ?? 'unknown';
		this.shadowRoot.innerHTML = `
			<div style="width: 50px; height: 50px; background: ${color}; border: 1px solid black; border-radius: 1rem;"></div>
		`;
	}
}
customElements.define(
	'arbor-token-color-value-preview',
	TokenColorValuePreview,
);
