import { css, html, LitElement } from 'lit-element';
import { getPreset } from '../registration.js';

class FunctionsList extends LitElement {
	static get styles() {
		return css`
			:host {
				width: 100%;
				min-width: 100px;
				display: flex;
				flex-direction: column;
				width: 100%;
				box-sizing: border-box;
			}

			h2 {
				font-size: var(
					--functionsList-title-size,
					var(--m-text-primary-size, 1.5rem)
				);
				font-weight: var(
					--functionsList-title-weight,
					var(--m-text-primary-weight, bold)
				);
				font-family: var(
					--functionsList-title-font,
					var(--m-text-primary-font, sans-serif)
				);
				margin-bottom: var(
					--functionsList-title-margin-bottom,
					var(--m-spacing-md, 8px)
				);
			}

			ul {
				display: flex;
				flex-direction: column;
				align-items: stretch;
				gap: var(--functionsList-item-gap, var(--m-spacing-sm, 4px));
				list-style: none;
				margin: 0;
				padding: 0;
				width: 100%;
				min-width: 100px;
				overflow: auto;
				max-height: 400px;
			}

			li {
				display: flex;
				flex-direction: column;
				width: 100%;
				min-width: 100px;
				box-sizing: border-box;
				padding: var(
					--functionsList-item-padding,
					var(--m-surface-padding, 8px)
				);
				border: var(
					--functionsList-item-border,
					var(--m-lineWidth, 1px) solid var(--m-border-color, #ccc)
				);
				border-radius: var(
					--functionsList-item-border-radius,
					var(--m-surface-radius, 4px)
				);
				font-size: var(
					--functionsList-item-size,
					var(--m-typography-size, 1rem)
				);
				font-weight: var(
					--functionsList-item-weight,
					var(--m-typography-weight, normal)
				);
				background-color: var(
					--functionsList-item-bg,
					var(--m-surface-ambient-bg, white)
				);
				color: var(
					--functionsList-item-color,
					var(--m-surface-ambient-fg, black)
				);

				.name {
					font-weight: var(
						--functionsList-item-name-weight,
						var(--m-typography-weight-bold, bold)
					);
					font-family: var(
						--functionsList-item-name-font,
						var(--m-typography-font, sans-serif)
					);
				}
				.description {
					font-size: var(
						--functionsList-item-description-size,
						var(--m-text-secondary-size, 0.875rem)
					);
					color: var(
						--functionsList-item-description-color,
						var(--m-color-neutral-heavy, darkgray)
					);
				}
			}
		`;
	}

	preset = getPreset();

	render() {
		const functions = Object.values(this.preset.functions).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
		return html`
			<h2>Functions</h2>
			<ul>
				${functions.map(
					(fn) =>
						html`<li>
							<span class="name">${fn.signature}</span>
							<span class="description">${fn.description}</span>
						</li>`,
				)}
			</ul>
		`;
	}
}

export default function register() {
	customElements.define('arbor-functions-list', FunctionsList);
}
