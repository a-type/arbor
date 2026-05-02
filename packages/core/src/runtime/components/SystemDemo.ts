import { isToken } from '@arbor-css/tokens';
import { generateStylesheet } from '../../stylesheet/generateStylesheet.js';
import { convertStructure } from '../../util/convertStructure.js';
import { getConfig } from '../registration.js';

class SystemDemo extends HTMLElement {
	constructor() {
		super();
		const config = getConfig();

		// get all color ranges and render them
		const colorRanges = Object.entries(config.primitives.$tokens.colors).filter(
			([, value]) => {
				return !isToken(value) && Object.values(value).some(isToken);
			},
		);

		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div>
				<details>
					<summary>Primitive Tokens</summary>
					<pre>${JSON.stringify(
						convertStructure(
							config.primitives.$tokens,
							isToken,
							(token) => token.name,
						),
						null,
						2,
					)}</pre>
				</details>
				<details>
					<summary>Mode Tokens</summary>
					<pre>${JSON.stringify(
						convertStructure(
							config.modes.base.schema.$tokens,
							isToken,
							(token) => token.name,
						),
						null,
						2,
					)}</pre>
				</details>
				<details>
					<summary>Generated CSS</summary>
					<pre>${generateStylesheet(config)}</pre>
				</details>
				<arbor-scheme-selector>
					<details open>
						<summary><h2 id="primitives" style="display: inline; margin: 0;">Primitive Tokens</h2></summary>
						<arbor-token-values schema-path="primitives.$tokens"></arbor-token-values>
					</details>
					<details open>
						<summary><h2 id="modes" style="display: inline; margin: 0;">Mode Tokens</h2></summary>
						<arbor-mode-selector>
							<arbor-token-values schema-path="modes.base.schema.$tokens"></arbor-token-values>
						</arbor-mode-selector>
					</details>
				</arbor-scheme-selector>
			</div>
			<style>
				h2 {
					font-size: 1.5rem;
					margin-bottom: 0.5rem;
				}
			</style>
		`;
	}
}

customElements.define('arbor-system-demo', SystemDemo);
