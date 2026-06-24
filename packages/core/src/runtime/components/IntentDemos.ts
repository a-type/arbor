import { css, html, LitElement } from 'lit-element';

class IntentDemos extends LitElement {
	static get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: var(--m-space-lg);
				box-sizing: border-box;
				width: 100%;
				padding: var(--m-space-lg);
			}

			.surface {
				background: var(--m-surface-ambient-bg);
				color: var(--m-surface-ambient-fg);
				border: var(--m-surface-ambient-border);
				padding: var(--m-surface-padding);
				border-radius: var(--m-surface-radius);

				&[data-emphasis='primary'] {
					background: var(--m-surface-primary-bg);
					color: var(--m-surface-primary-fg);
					border: var(--m-surface-primary-border);
				}

				&[data-emphasis='secondary'] {
					background: var(--m-surface-secondary-bg);
					color: var(--m-surface-secondary-fg);
					border: var(--m-surface-secondary-border);
				}
			}

			.control {
				padding: var(--m-control-padding);
				background: var(--m-control-bg);
				color: var(--m-control-fg);
				border: var(--m-control-border);
				border-radius: var(--m-control-radius);
			}

			.action {
				padding: var(--m-action-padding);
				background: var(--m-action-primary-bg);
				color: var(--m-action-primary-fg);
				border: var(--m-action-primary-border);
				border-radius: var(--m-action-radius);

				&[data-emphasis='secondary'] {
					background: var(--m-action-secondary-bg);
					color: var(--m-action-secondary-fg);
					border: var(--m-action-secondary-border);
				}

				&[data-emphasis='ambient'] {
					background: var(--m-action-ambient-bg);
					color: var(--m-action-ambient-fg);
					border: var(--m-action-ambient-border);
				}
			}

			.text {
				font-size: var(--m-prose-primary-size);
				font-weight: var(--m-prose-primary-weight);
				font-family: var(--m-prose-primary-font);
				letter-spacing: var(--m-prose-primary-letter-spacing);

				&[data-emphasis='secondary'] {
					font-size: var(--m-prose-secondary-size);
					font-weight: var(--m-prose-secondary-weight);
					font-family: var(--m-prose-secondary-font);
					letter-spacing: var(--m-prose-secondary-letter-spacing);
				}

				&[data-emphasis='ambient'] {
					font-size: var(--m-prose-ambient-size);
					font-weight: var(--m-prose-ambient-weight);
					font-family: var(--m-prose-ambient-font);
					letter-spacing: var(--m-prose-ambient-letter-spacing);
				}
			}

			.content {
				background: var(--m-color-neutral);
				color: var(--m-color-neutral-ink);
				border: 1px dashed var(--m-color-neutral-heavy);
				padding: var(--m-space-sm);
				opacity: 0.5;
			}
		`;
	}

	render() {
		return html`
			<div class="surface" data-emphasis="primary">
				<div class="content">Surface - Primary</div>
			</div>
			<div class="surface" data-emphasis="secondary">
				<div class="content">Surface - Secondary</div>
			</div>
			<div class="surface" data-emphasis="ambient">
				<div class="content">Surface - Ambient</div>
			</div>
			<div class="control">
				<div class="content">Control</div>
			</div>
			<div class="action" data-emphasis="primary">
				<div class="content">Action - Primary</div>
			</div>
			<div class="action" data-emphasis="secondary">
				<div class="content">Action - Secondary</div>
			</div>
			<div class="action" data-emphasis="ambient">
				<div class="content">Action - Ambient</div>
			</div>
			<div class="text" data-emphasis="primary">Text - Primary</div>
			<div class="text" data-emphasis="secondary">Text - Secondary</div>
			<div class="text" data-emphasis="ambient">Text - Ambient</div>
		`;
	}
}

export default function register() {
	customElements.define('arbor-intent-demos', IntentDemos);
}
