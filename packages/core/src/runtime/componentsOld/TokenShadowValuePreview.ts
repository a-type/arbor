import { ArborElement } from './BaseElement.js';

class ShadowValuePreview extends ArborElement {
	constructor() {
		super();
		const shadow = this.getAttribute('shadow') ?? 'none';
		this.shadowRoot.innerHTML = `
		<div style="padding: 20px; display: flex;">
			<div style="place-self: center; width: 20px; height: 20px; background: white; border: 1px solid black; box-shadow: ${shadow};"></div>
			</div>
		`;
	}
}
customElements.define('arbor-token-shadow-value-preview', ShadowValuePreview);
