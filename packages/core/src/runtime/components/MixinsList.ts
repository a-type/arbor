import { css, html, LitElement } from 'lit-element';
import { getPreset } from '../registration.js';

class MixinsList extends LitElement {
	static get styles() {
		return css`
			:host {
				display: block;
				box-sizing: border-box;
				width: 100%;
			}
			.root {
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
			}

			li {
				display: flex;
				flex-direction: column;
				width: 100%;
				padding: var(
					--functionsList-item-padding,
					var(--m-surface-padding, 8px)
				);
				border: var(
					--functionsList-item-border,
					1px solid var(--m-border-color, #ccc)
				);
				border-radius: var(--functionsList-item-border-radius, 4px)
				font-size: var(
					--functionsList-item-size,
					var(--m-primitive-typography-size, 1rem)
				);
				font-weight: var(
					--functionsList-item-weight,
					var(--m-primitive-typography-weight, normal)
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
						var(--m-primitive-typography-weight-bold, bold)
					);
					font-family: var(
						--functionsList-item-name-font,
						var(--m-primitive-typography-font, sans-serif)
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
		const mixins = Object.values(this.preset.mixins).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
		return html`
			<div class="root">
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
			</div>
		`;
	}
}

export default function register() {
	customElements.define('arbor-mixins-list', MixinsList);
}
