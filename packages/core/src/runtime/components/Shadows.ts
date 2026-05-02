import { isToken } from '@arbor-css/tokens';
import { getConfig } from '../registration.js';

class Shadows extends HTMLElement {
	constructor() {
		super();

		const config = getConfig();
		const shadows = config.primitives.$tokens.shadows;

		if (isToken(shadows)) {
			throw new Error(
				`Shadows is not a valid token range (it's an individual token)`,
			);
		}

		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div>
				${Object.keys(shadows)
					.map((key) => {
						const value = shadows[key];
						if (!isToken(value)) {
							throw new Error(`Shadow level "${key}" is not a valid token`);
						}
						return `<div class="shadow-sample" style="box-shadow: ${value.var}; margin: 1rem; padding: 1rem;">${key}</div>`;
					})
					.join('\n')}
			</div>
		`;
	}
}

customElements.define('arbor-shadows', Shadows);
