import { isToken } from '@arbor-css/tokens';
import { getConfig } from '../registration.js';

class Typography extends HTMLElement {
	constructor() {
		super();

		const config = getConfig();
		const typography = config.primitives.$tokens.typography;

		if (isToken(typography)) {
			throw new Error(
				`Typography is not a valid token range (it's an individual token)`,
			);
		}

		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div>
				${Object.keys(typography)
					.map((key) => {
						const value = typography[key];
						// we expect these values on typography tokens...
						const { size, weight, lineHeight } = value as any;
						if (!size || !weight || !lineHeight) {
							throw new Error(
								`Typography level "${key}" is missing expected properties (size, weight, lineHeight)`,
							);
						}
						console.log(value);
						return `<div class="type-sample" style="font-size: ${size.var}; font-weight: ${weight.var}; line-height: ${lineHeight.var};">${key}: The quick brown fox jumps over the lazy dog.</div>`;
					})
					.join('\n')}
			</div>
		`;
	}
}

customElements.define('arbor-typography', Typography);
