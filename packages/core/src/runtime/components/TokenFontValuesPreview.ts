class TokenFontValuesPreview extends HTMLElement {
	constructor() {
		super();
		const size = this.getAttribute('size') ?? 'unknown';
		const weight = this.getAttribute('weight') ?? 'normal';
		const lineHeight = this.getAttribute('line-height') ?? 'normal';
		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div style="font-size: ${size}; font-weight: ${weight}; line-height: ${lineHeight}; border: 1px solid black; padding: 0.5rem;">Aa</div>
		`;
	}
}
customElements.define(
	'arbor-token-font-values-preview',
	TokenFontValuesPreview,
);
