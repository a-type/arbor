import { isToken } from '@arbor-css/tokens';
import { css, html, LitElement } from 'lit-element';
import { resolveComputedTokenValue } from '../../util/resolveComputedTokenValue.js';
import { getPreset } from '../registration.js';

class SpacingScale extends LitElement {
	static get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: var(--m-spacing-lg);
				box-sizing: border-box;
				width: 100%;
			}

			.step {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
			}

			.size {
				background: var(--m-color-main-ink);
				color: var(--m-color-main-wash);
				aspect-ratio: 1 / 1;
			}
		`;
	}

	preset = getPreset();

	render() {
		const steps = Object.values(this.preset.$.mode.spacing)
			.filter(isToken)
			.map((token: any) => ({
				name: token.name,
				value: resolveComputedTokenValue(this.preset, token.name),
			}));

		return html`
			${steps.map(
				({ name, value }) => html`
					<div class="step">
						<div>${name} - ${value}</div>
						<div class="size" style="width: ${value};"></div>
					</div>
				`,
			)}
		`;
	}
}

export default function register() {
	customElements.define('arbor-spacing-scale', SpacingScale);
}
