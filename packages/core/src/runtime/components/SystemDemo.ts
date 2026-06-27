import { css, html, LitElement } from 'lit-element';

class SystemDemo extends LitElement {
	static get styles() {
		return css`
			:host {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
				gap: var(--m-space-lg);
				box-sizing: border-box;
				width: 100%;
			}
		`;
	}

	render() {
		return html`
			<div>
				<arbor-intent-demos></arbor-intent-demos>
				<hr />
				<arbor-spacing-scale></arbor-spacing-scale>
				<arbor-shadow-scale></arbor-shadow-scale>
				<hr />
				<arbor-mixins-list></arbor-mixins-list>
				<arbor-functions-list></arbor-functions-list>
			</div>
			<arbor-mode-graph mode="base"></arbor-mode-graph>
			<arbor-outputs></arbor-outputs>
		`;
	}
}

export default function register() {
	customElements.define('arbor-system-demo', SystemDemo);
}
