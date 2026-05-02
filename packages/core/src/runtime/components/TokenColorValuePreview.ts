class TokenColorValuePreview extends HTMLElement {
	constructor() {
		super();
		const color = this.getAttribute('color') ?? 'unknown';
		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div style="width: 50px; height: 50px; background: ${color}; border: 1px solid black; border-radius: 1rem;"></div>
		`;
	}
}
customElements.define(
	'arbor-token-color-value-preview',
	TokenColorValuePreview,
);
