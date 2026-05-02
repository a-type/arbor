class TokenValuePreview extends HTMLElement {
	constructor() {
		super();
		const value = this.getAttribute('value');
		const purpose = this.getAttribute('purpose');

		let preview: string;
		switch (purpose) {
			case 'color':
				preview = `<arbor-token-color-value-preview color="${value}"></arbor-token-color-value-preview>`;
				break;
			case 'spacing':
				preview = `<arbor-token-size-value-preview size="${value}"></arbor-token-size-value-preview>`;
				break;
			case 'shadow':
				preview = `<arbor-token-shadow-value-preview shadow="${value}"></arbor-token-shadow-value-preview>`;
				break;
			default:
				preview = `<div style="width: 50px; height: 50px; border: 1px solid black; display: flex; align-items: center; justify-content: center;">?</div>`;
		}

		this.attachShadow({ mode: 'open' }).innerHTML = preview;
	}
}

customElements.define('arbor-token-value-preview', TokenValuePreview);
