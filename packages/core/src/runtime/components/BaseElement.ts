import { getConfig, getStyleSheet } from '../registration.js';

export class ArborElement extends HTMLElement {
	shadowRoot!: ShadowRoot;
	config = getConfig();
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.adoptedStyleSheets.push(getStyleSheet());
	}
}
