import { isToken } from '@arbor-css/tokens';
import { getConfig } from '../registration.js';

class Spacing extends HTMLElement {
	constructor() {
		super();

		const config = getConfig();
		const spacing = config.primitives.$tokens.spacing;

		if (isToken(spacing)) {
			throw new Error(
				`Spacing is not a valid token range (it's an individual token)`,
			);
		}

		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div>
				${Object.keys(spacing)
					.map((key) => {
						const value = spacing[key];
						if (!isToken(value)) {
							throw new Error(`Spacing level "${key}" is not a valid token`);
						}
						return `<div class="spacing-sample" style="padding: ${value.var}; background-color: #eee; margin-bottom: 0.5rem;">${key}: ${value.var}</div>`;
					})
					.join('\n')}
			</div>
		`;
	}
}

customElements.define('arbor-spacing', Spacing);
