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
				<h2>Color Ranges</h2>
				${colorRanges
					.map(
						([name]) =>
							`<arbor-color-range color="${name}"></arbor-color-range>`,
					)
					.join('\n')}
				<h2>Typography</h2>
				<arbor-typography></arbor-typography>
				<h2>Spacing</h2>
				<arbor-spacing></arbor-spacing>
				<h2>Shadows</h2>
				<arbor-shadows></arbor-shadows>
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
