import { css, html, LitElement } from 'lit-element';
import { getPreset } from '../registration.js';

class MixinsList extends LitElement {
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
					var(--m-prose-primary-size, 1.5rem)
				);
				font-weight: var(
					--functionsList-title-weight,
					var(--m-prose-primary-weight, bold)
				);
				font-family: var(
					--functionsList-title-font,
					var(--m-prose-primary-font, sans-serif)
				);
				margin-bottom: var(
					--functionsList-title-margin-bottom,
					var(--m-space-md, 8px)
				);
			}

			ul {
				display: flex;
				flex-direction: column;
				align-items: stretch;
				gap: var(--functionsList-item-gap, var(--m-space-sm, 4px));
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
				font-size: var(--functionsList-item-size, var(--m-text-size, 1rem));
				font-weight: var(
					--functionsList-item-weight,
					var(--m-text-weight, normal)
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
						var(--m-text-weight-bold, bold)
					);
					font-family: var(
						--functionsList-item-name-font,
						var(--m-text-font, sans-serif)
					);
				}
				.description {
					font-size: var(
						--functionsList-item-description-size,
						var(--m-prose-secondary-size, 0.875rem)
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
		const mixins = Object.values(this.preset.mixins).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
		return html`
			<h2>Mixins</h2>
			<ul>
				${mixins.map(
					(mx) =>
						html`<li>
							<span class="name">${mx.signature}</span>
							<span class="description">${mx.description}</span>
						</li>`,
				)}
			</ul>
		`;
	}
}

export default function register() {
	customElements.define('arbor-mixins-list', MixinsList);
}
