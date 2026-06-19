import { flattenTokenSchema } from '@arbor-css/tokens';
import { css, html, LitElement } from 'lit-element';
import { resolveComputedTokenValue } from '../../util/resolveComputedTokenValue.js';
import { getContext, getPreset } from '../registration.js';

class LiveEditor extends LitElement {
	static get properties() {
		return {
			target: { type: String },
		};
	}
	static get styles() {
		return css`
			:host {
				position: fixed;
				top: 0;
				right: 0;
			}

			.pane {
				display: flex;
				flex-direction: column;
				gap: var(--m-spacing-sm);
				padding: var(--m-spacing-sm);
				background: var(--m-surface-ambient-bg);
				border-radius: var(--m-surface-radius);
				box-shadow: var(--m-shadow-lg);
			}

			.controls {
				flex-shrink: 0;
				display: flex;
				flex-direction: row;
			}

			.filter {
				flex-grow: 1;
			}

			button {
				background: transparent;
				color: inherit;
				border: none;
				cursor: pointer;
				transition: all var(--m-duration) var(--m-easing);
				padding: var(--m-spacing-xs);
				border-radius: var(--m-action-radius);
				min-width: 32px;
				min-height: 32px;

				&:hover {
					background: var(--m-color-main-light);
					color: var(--m-color-main-ink);
				}
				&:active {
					background: var(--m-color-main);
				}
				&:focus {
					outline: 2px solid var(--m-color-main);
				}
			}

			.list {
				display: flex;
				flex-direction: column;
				gap: var(--m-spacing-xs);
				padding: var(--m-spacing-sm);
				max-height: 300px;
				min-height: 0;
				overflow: auto;
				width: 300px;
			}

			.token {
				display: flex;
				flex-direction: column;
				align-items: start;
				gap: var(--m-spacing-xs);
			}

			.token-name {
				font-size: var(--m-text-ambient-size);
			}

			.sr-only {
				position: absolute;
				width: 1px;
				height: 1px;
				padding: 0;
				margin: -1px;
				overflow: clip;
				clip: rect(0, 0, 0, 0);
				border: 0;
			}
		`;
	}

	target = 'html';
	preset = getPreset();
	filter = '';
	open = false;

	render() {
		const flatTokens = flattenTokenSchema(this.preset.$.mode);

		if (!this.open) {
			return html`
				<button
					@click=${() => {
						this.open = true;
						this.requestUpdate();
					}}
				>
					<span aria-hidden="true">⚙️</span>
					<span class="sr-only">Open live editor</span>
				</button>
			`;
		}

		return html`
			<div class="pane">
			<div class="controls">
				<input
					class="filter
					type="text"
					placeholder="Filter tokens..."
					.value=${this.filter}
					@input=${(e: Event) => {
						this.filter = (e.target as HTMLInputElement).value;
						this.requestUpdate();
					}}
				/>
				<button
					@click=${() => {
						this.open = false;
						this.requestUpdate();
					}}
				>
					<span aria-hidden="true">×</span>
					<span class="sr-only">Close live editor</span>
				</button>
			</div>
			<div class="list">
				${flatTokens
					.filter((token) => token.name.includes(this.filter))
					.map((token) => {
						let editor;
						if (token.type === 'color' || token.purpose === 'background') {
							editor = html`<arbor-color-token-editor
								target=${this.target}
								token=${token.name}
							></arbor-color-token-editor>`;
						} else if (
							token.type === 'length' ||
							token.type === 'length-percentage' ||
							token.purpose === 'spacing' ||
							token.purpose === 'size' ||
							token.purpose === 'border-radius' ||
							token.purpose === 'border-width' ||
							token.purpose === 'shadow-blur' ||
							token.purpose === 'shadow-spread' ||
							token.purpose === 'shadow-x' ||
							token.purpose === 'shadow-y' ||
							token.purpose === 'font-size' ||
							token.purpose === 'line-height'
						) {
							editor = html`<arbor-size-token-editor
								target=${this.target}
								token=${token.name}
							></arbor-size-token-editor>`;
						} else if (token.type === 'number' || token.purpose === 'scalar') {
							editor = html`<arbor-scalar-token-editor
								target=${this.target}
								token=${token.name}
							></arbor-scalar-token-editor>`;
						} else {
							editor = html`<arbor-generic-token-editor
								target=${this.target}
								token=${token.name}
							></arbor-generic-token-editor>`;
						}
						return html`
							<label class="token">
								<div class="token-name">${token.name}</div>
								${editor}
							</label>
						`;
					})}
			</div>
			</div>
		`;
	}
}

class BaseTokenEditor extends LitElement {
	static get properties() {
		return {
			target: { type: String },
			token: { type: String },
		};
	}

	target = 'html';
	token = '';
	preset = getPreset();

	updateTokenValue(newValue: string) {
		const targetElements = document.querySelectorAll(this.target);
		targetElements.forEach((el) => {
			(el as HTMLElement).style.setProperty(this.token, newValue);
		});
	}

	getTokenValue() {
		return (
			resolveComputedTokenValue(this.preset, this.token, getContext()) ?? ''
		);
	}
}

class ColorTokenEditor extends BaseTokenEditor {
	static get styles() {
		return css`
			:host {
				width: 100%;
			}
		`;
	}

	render() {
		return html`
			<input
				type="color"
				.value=${this.getTokenValue()}
				@input=${(e: Event) => {
					this.updateTokenValue((e.target as HTMLInputElement).value);
				}}
			/>
		`;
	}
}

class SizeTokenEditor extends BaseTokenEditor {
	static get styles() {
		return css`
			:host {
				display: inline-flex;
				align-items: center;
				gap: var(--m-spacing-xs);
				width: 100%;
			}
		`;
	}

	render() {
		const value = this.getTokenValue();
		const unit = value.replace(/[\d.]/g, '');
		const number = parseFloat(value);
		const stepSize = unit === 'rem' ? 0.1 : 1;
		const min = 0;
		const max = 1000;
		return html`
			<input
				type="number"
				.value=${isNaN(number) ? 0 : number}
				@input=${(e: Event) => {
					this.updateTokenValue(
						`${(e.target as HTMLInputElement).value}${unit}`,
					);
				}}
				step=${stepSize}
				min=${min}
				max=${max}
			/>
			<span>${unit}</span>
		`;
	}
}

class ScalarTokenEditor extends BaseTokenEditor {
	static get styles() {
		return css`
			:host {
				width: 100%;
			}
		`;
	}

	render() {
		return html`
			<input
				type="number"
				.value=${this.getTokenValue()}
				@input=${(e: Event) => {
					this.updateTokenValue((e.target as HTMLInputElement).value);
				}}
			/>
		`;
	}
}

class GenericTokenEditor extends BaseTokenEditor {
	static get styles() {
		return css``;
	}

	render() {
		return html`
			<input
				type="text"
				.value=${this.getTokenValue()}
				@input=${(e: Event) => {
					this.updateTokenValue((e.target as HTMLInputElement).value);
				}}
			/>
		`;
	}
}

export default function register() {
	customElements.define('arbor-live-editor', LiveEditor);
	customElements.define('arbor-color-token-editor', ColorTokenEditor);
	customElements.define('arbor-size-token-editor', SizeTokenEditor);
	customElements.define('arbor-scalar-token-editor', ScalarTokenEditor);
	customElements.define('arbor-generic-token-editor', GenericTokenEditor);
}
