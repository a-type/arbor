class TokenSizeValuePreview extends HTMLElement {
	constructor() {
		super();
		const size = this.getAttribute('size') ?? 'unknown';
		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div style="width: ${size}; height: ${size}; border: 1px solid black;"></div>
		`;
	}
}
customElements.define('arbor-token-size-value-preview', TokenSizeValuePreview);
