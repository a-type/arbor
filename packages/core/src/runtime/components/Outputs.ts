import { isToken } from '@arbor-css/tokens';
import { convertStructure } from '@arbor-css/util';
import { html, LitElement } from 'lit-element';
import { generateStylesheet } from '../../stylesheet/generateStylesheet.js';
import { getPreset } from '../registration.js';

export class ArborOutputs extends LitElement {
	preset = getPreset();
	render() {
		return html`
			<details>
				<summary>Primitive Tokens</summary>
				<pre>
${JSON.stringify(
						convertStructure(
							this.preset.$.mode.primitive,
							isToken,
							(token) => token.name,
						),
						null,
						2,
					)}</pre
				>
			</details>
			<details>
				<summary>Mode Tokens</summary>
				<pre>
${JSON.stringify(
						convertStructure(
							this.preset.$.mode,
							isToken,
							(token) => token.name,
						),
						null,
						2,
					)}</pre
				>
			</details>
			<details>
				<summary>Generated CSS</summary>
				<pre>
${generateStylesheet(this.preset, {
						skipBaking: false,
					})}</pre
				>
			</details>
		`;
	}
}

export default function register() {
	customElements.define('arbor-outputs', ArborOutputs);
}
