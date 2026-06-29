import { flattenTokenSchema } from '@arbor-css/tokens';
import { css, html, LitElement } from 'lit-element';
import { resolveComputedTokenValue } from '../../util/resolveComputedTokenValue.js';
import { getContext, getPreset } from '../registration.js';

class EasingScale extends LitElement {
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
				flex-direction: column;
				align-items: stretch;
			}

			.mainRow {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				gap: var(--m-space-xs);
			}

			.value {
				font-size: var(--m-prose-ambient-size);
				color: var(--m-color-neutral-heavy);
			}

			.trigger {
				background: var(--m-action-secondary-bg);
				color: var(--m-action-secondary-fg);
				aspect-ratio: 1 / 1;
				padding: var(--m-space-xs);
				border-radius: var(--m-radius-sm);

				cursor: pointer;

				&:hover,
				&:focus,
				&:active {
					background: var(--m-action-primary-bg);
					color: var(--m-action-primary-fg);
				}
			}

			.demoTrack {
				width: 200px;
				height: 10px;
				background: var(--m-color-neutral-wash);
				border-radius: var(--m-radius-sm);
				overflow: hidden;
				position: relative;
			}

			.demoSled {
				width: 10px;
				height: 10px;
				background: var(--m-color-neutral-ink);
				border-radius: var(--m-radius-sm);
				position: absolute;
				right: calc(100% - 10px);
				top: 0;
				bottom: 0;
				transition-property: right;
				transition-duration: 1s;

				input:checked + .demoTrack > & {
					right: 0;
				}
			}
		`;
	}

	preset = getPreset();

	render() {
		const steps = flattenTokenSchema(this.preset.$.mode.easing).map(
			(token) => ({
				name: token.name,
				value: resolveComputedTokenValue(this.preset, token.name, getContext()),
			}),
		);

		return html`
			${steps.map(
				({ name, value }) => html`
					<div class="step">
						<div class="mainRow">
							<div>${name}</div>
							<div class="mainRow">
								<input type="checkbox" />
								<div class="demoTrack">
									<div
										class="demoSled"
										style="transition-timing-function: var(${name});"
									></div>
								</div>
							</div>
						</div>
						<div class="value">${value}</div>
					</div>
				`,
			)}
		`;
	}
}

export default function register() {
	customElements.define('arbor-easing-scale', EasingScale);
}
