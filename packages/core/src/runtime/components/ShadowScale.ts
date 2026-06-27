import { css, html, LitElement } from 'lit-element';
import { isToken, resolveComputedTokenValue } from '../../index.js';
import { getContext, getPreset } from '../registration.js';

class ShadowScale extends LitElement {
	static get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: var(--m-space-lg);
				box-sizing: border-box;
				width: 100%;
			}

			.step {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
			}

			.valueStack {
				display: flex;
				flex-direction: column;
				gap: var(--m-space-xs);
			}

			.value {
				font-size: var(--m-prose-ambient-size);
				color: var(--m-color-neutral-heavy);
			}

			.size {
				background: var(--m-color-neutral-wash);
				color: var(--m-color-main-wash);
				aspect-ratio: 1 / 1;
				width: 100px;
				height: 30px;
				margin: var(--m-space-md);
			}
		`;
	}

	preset = getPreset();

	render() {
		const steps = Object.values(this.preset.$.mode.shadow)
			.filter((level) => !!('$root' in level))
			.map((level) => (level as any).$root)
			.filter(isToken)
			.map((token: any) => ({
				name: token.name,
				value: resolveComputedTokenValue(this.preset, token.name, getContext()),
			}));

		return html`
			${steps.map(
				({ name, value }) => html`
					<div class="step">
						<div class="valueStack">
							<div>${name}</div>
							<div class="value">${value}</div>
						</div>
						<div class="size" style="box-shadow: ${value}"></div>
					</div>
				`,
			)}
		`;
	}
}

export default function register() {
	customElements.define('arbor-shadow-scale', ShadowScale);
}
