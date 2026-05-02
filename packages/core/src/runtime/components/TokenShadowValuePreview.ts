class ShadowValuePreview extends HTMLElement {
	constructor() {
		super();
		const shadow = this.getAttribute('shadow') ?? 'none';
		this.attachShadow({ mode: 'open' }).innerHTML = `
		<div style="padding: 20px; display: flex;">
			<div style="place-self: center; width: 20px; height: 20px; background: white; border: 1px solid black; box-shadow: ${shadow};"></div>
			</div>
		`;
	}
}
customElements.define('arbor-token-shadow-value-preview', ShadowValuePreview);
