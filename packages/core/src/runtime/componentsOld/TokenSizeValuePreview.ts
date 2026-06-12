import { ArborElement } from './BaseElement.js';

class TokenSizeValuePreview extends ArborElement {
	constructor() {
		super();
		const size = this.getAttribute('size') ?? 'unknown';
		this.shadowRoot.innerHTML = `
			<div style="width: ${size}; height: ${size}; border: 1px solid black;"></div>
		`;
	}
}
customElements.define('arbor-token-size-value-preview', TokenSizeValuePreview);
