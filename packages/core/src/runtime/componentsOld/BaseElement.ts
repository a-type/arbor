import { ArborPreset } from '@arbor-css/preset';
import { getPreset, getStyleSheet, ready } from '../registration.js';

export class ArborElement extends HTMLElement {
	shadowRoot!: ShadowRoot;
	config!: ArborPreset;
	constructor() {
		super();
		ready.then(() => {
			this.config = getPreset();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.adoptedStyleSheets.push(getStyleSheet());
			this.render();
		});
	}

	render() {}
}
