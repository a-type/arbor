import { isCss, printCss } from '@arbor-css/css-eval';
import { ArborPreset, getInternals } from '@arbor-css/preset';
import { isToken } from '@arbor-css/tokens';
import { css, html, LitElement } from 'lit-element';
import {
	buildModeTokenGraph,
	ModeTokenGraph,
} from '../../util/buildModeTokenGraph.js';
import {
	getContext,
	getPreset,
	subscribeToEnvChanges,
} from '../registration.js';

const graphCache = new Map();
subscribeToEnvChanges(() => {
	graphCache.clear();
});
function memoizedTokenGraph(
	modeName: string,
	preset: ArborPreset,
): ModeTokenGraph {
	const cacheKey = `${modeName}`;
	if (graphCache.has(cacheKey)) {
		return graphCache.get(cacheKey)!;
	}
	const modeInstance =
		modeName === 'base' ?
			preset.baseMode
		:	getInternals(preset).modes[modeName];
	if (!modeInstance) {
		throw new Error(`Mode "${modeName}" not found in preset.`);
	}
	const graph = buildModeTokenGraph(modeInstance, preset, {
		...getContext(),
		skipBaking: false,
	});
	graphCache.set(cacheKey, graph);
	return graph;
}

class ModeGraph extends LitElement {
	static get properties() {
		return {
			mode: { type: String },
		};
	}

	static get styles() {
		return css`
			.root {
				display: flex;
				flex-direction: column;
				width: 100%;
				box-sizing: border-box;
			}

			.header {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				gap: var(--modeGraph-header-gap, var(--m-spacing-md, 12px));
				padding-block: var(
					--modeGraph-header-padding,
					var(--m-surface-padding, 8px)
				);
			}
			.mode-name {
				font-weight: var(
					--modeGraph-mode-name-font-weight,
					var(--m-primitive-typography-weight-bold, bold)
				);
				font-family: monospace;
			}

			.tokens {
				display: flex;
				flex-direction: column;
				font-family: monospace;
			}
		`;
	}

	mode = '';
	preset = getPreset();

	constructor() {
		super();
		subscribeToEnvChanges(() => this.render());
	}

	render() {
		const graph = memoizedTokenGraph(this.mode, this.preset);

		return html`
			<div class="root">
				<div class="header">
					<span class="mode-name">@mode-${this.mode}</span>
					<span class="mode-summary">
						${graph.roots.length} token${graph.roots.length === 1 ? '' : 's'}
					</span>
				</div>
				<div class="tokens">
					${graph.roots.map((tokenName) => {
						return html`<arbor-mode-graph-token
							mode=${this.mode}
							name=${tokenName}
						></arbor-mode-graph-token>`;
					})}
				</div>
			</div>
		`;
	}
}

class ModeGraphToken extends LitElement {
	static get properties() {
		return {
			mode: { type: String },
			name: { type: String },
			dependency: { type: String, optional: true },
			depth: { type: Number, optional: true },
		};
	}

	static get styles() {
		return css`
			details {
				padding: var(--modeGraph-token-padding, var(--m-surface-padding, 8px));
				border: var(
					--modeGraph-token-borderColor,
					var(--m-lineWidth, 1) solid var(--m-surface-ambient-borderColor, gray)
				);
				border-radius: var(
					--modeGraph-token-border-radius,
					var(--m-surface-radius, 4px)
				);
				background-color: var(
					--modeGraph-token-bg,
					var(--m-surface-ambient-bg, white)
				);
				color: var(--modeGraph-token-color, var(--m-surface-ambient-fg, black));
				width: 100%;
				box-sizing: border-box;
			}

			summary {
				cursor: pointer;
				display: flex;
				flex-direction: column;
			}
			.summary-line {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: start;
				white-space: nowrap;
				gap: var(--modeGraph-token-summary-gap, var(--m-spacing-sm, 4px));
				max-width: 100%;
			}
			.sub-line {
				color: var(
					--modeGraph-token-sub-line-color,
					var(--m-color-neutral-heavy, gray)
				);
				font-size: var(
					--modeGraph-token-sub-line-font-size,
					var(--m-text-ambient-size, 12px)
				);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				min-width: 0;
				max-width: 100%;

				& > span {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.name {
				font-weight: var(
					--modeGraph-token-name-font-weight,
					var(--m-primitive-typography-weight-bold, bold)
				);
			}

			.value {
				display: inline-flex;
				flex-direction: row;
				align-items: center;
				gap: var(--modeGraph-token-value-gap, var(--m-spacing-sm, 4px));
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.computed,
			.base-computed {
				color: var(
					--modeGraph-token-computed-color,
					var(--m-surface-ambient-fg, black)
				);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.base-computed {
				opacity: 0.6;
				&::after {
					content: '→';
					margin-inline: 4px;
				}
			}
			.computed {
				font-weight: var(
					--modeGraph-token-computed-font-weight,
					var(--m-primitive-typography-weight-bold, bold)
				);
			}

			.caret {
				display: inline-block;
				transition: transform 0.2s ease;
				font-family: monospace;
			}
			details[open] .caret {
				transform: rotate(90deg);
			}

			details::details-content {
				max-height: 0;
				transition: max-height var(--m-duration, 0.2s) var(--m-easing, ease);
			}
			details[open]::details-content {
				overflow-y: auto;
				max-height: 400px;
			}

			.dependents {
				padding-left: var(
					--modeGraph-token-dependents-indent,
					var(--m-spacing-md, 12px)
				);
				display: flex;
				flex-direction: column;
				gap: var(--modeGraph-token-dependents-gap, var(--m-spacing-sm, 4px));
				list-style: none;
				margin: 0;
			}

			.dependent {
				color: var(
					--modeGraph-token-dependent-color,
					var(--m-surface-ambient-fg, black)
				);
				font-size: var(
					--modeGraph-token-dependent-font-size,
					var(--m-primitive-typography-size, 14px)
				);
				display: flex;
				flex-direction: column;
			}

			.dependent-reference {
				color: var(
					--modeGraph-token-dependent-reference-color,
					var(--m-color-main-heavy, black)
				);
				font-weight: var(
					--modeGraph-token-dependent-reference-font-weight,
					var(--m-primitive-typography-weight-bold, bold)
				);
			}
		`;
	}

	name = '';
	mode = '';
	dependency = '@@none';
	depth = 0;
	preset = getPreset();

	// need to manually subscribe to trigger updates
	// when windows size changes vw units, etc
	connectedCallback() {
		super.connectedCallback();
		subscribeToEnvChanges(() => this.requestUpdate());
	}

	render() {
		const baseGraph = memoizedTokenGraph('base', this.preset);
		const graph = memoizedTokenGraph(this.mode, this.preset);
		const tokenNode = graph.nodes[this.name];

		if (!tokenNode) {
			return html`<div>
				Token "${this.name}" not found in mode "${this.mode}".
			</div>`;
		}

		const definitionRaw =
			isCss(tokenNode.raw) ? printCss(tokenNode.raw)
			: isToken(tokenNode.raw) ? tokenNode.raw.name
			: tokenNode.raw.toString();

		const changed = baseGraph.nodes[this.name]?.computed !== tokenNode.computed;

		// replace reference to the referenced token with a span so it's highlighted in the definition
		const definitionRest = definitionRaw.split(this.dependency);
		const definitionInterleaved = [];
		for (let i = 0; i < definitionRest.length; i++) {
			definitionInterleaved.push(definitionRest[i]);
			if (i < definitionRest.length - 1) {
				definitionInterleaved.push(
					html`<span class="dependent-reference">${this.dependency}</span>`,
				);
			}
		}

		return html`
			<details>
				<summary>
					<div class="summary-line">
						<span class="name">${this.name}</span>
						<span class="value">
							${changed ?
								html`<span
									class="base-computed"
									title="${baseGraph.nodes[this.name]?.computed ?? 'n/a'}"
									>${baseGraph.nodes[this.name]?.computed ?? 'n/a'}</span
								>`
							:	''}
							<span class="computed" title="${tokenNode.computed}"
								>${tokenNode.computed}</span
							>
						</span>
					</div>
					${this.depth > 0 ?
						html`<div class="summary-line sub-line">
							<span class="definition" title="${definitionRaw}">
								${definitionInterleaved}
							</span>
						</div>`
					:	''}
					${tokenNode.dependents.length > 0 ?
						html`
							<div class="summary-line sub-line" style="margin-bottom: 4px;	">
								<span>
									<div class="caret">&gt;</div>
									<span
										>${tokenNode.dependents.length} dependent(s) - tap to
										show</span
									>
								</span>
							</div>
						`
					:	''}
				</summary>
				<ul class="dependents">
					${tokenNode.dependents.map((dep) => {
						return html`<li class="dependent">
							<arbor-mode-graph-token
								mode=${this.mode}
								name=${dep}
								dependency=${this.name}
								depth=${this.depth + 1}
							></arbor-mode-graph-token>
						</li> `;
					})}
				</ul>
			</details>
		`;
	}
}

export default () => {
	customElements.define('arbor-mode-graph', ModeGraph);
	customElements.define('arbor-mode-graph-token', ModeGraphToken);
};
