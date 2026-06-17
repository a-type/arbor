import { css, html, LitElement } from 'lit-element';

class ColorSwatch extends LitElement {
	static get properties() {
		return {
			value: { type: String },
		};
	}

	static get styles() {
		return css`
			:host {
				display: flex;
			}
			.root {
				display: inline-block;
				width: 16px;
				height: 16px;
				border-radius: 4px;
				border: 1px solid var(--m-color-neutral-ink, black);
			}
		`;
	}

	value: string = '';

	render() {
		return html`
			<div
				class="root"
				style="background-color: ${this.value};"
				title="${this.value}"
			></div>
		`;
	}
}

export default function register() {
	customElements.define('arbor-color-swatch', ColorSwatch);
}
