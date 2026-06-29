import { css, html, LitElement } from 'lit-element';
import {
	createColorDarkModeRange,
	createColorLightModeRange,
} from '../src/presets/arborPreset';
import { getContext, getPreset, ready } from '../src/runtime/index.js';

const oklchMatcher = /oklch\(([0-9.%]+),?\s?([0-9.%]+),?\s?([0-9.%]+)\)/;

class MainColorRangeDebug extends LitElement {
	static get styles() {
		return css`
			.range {
				display: flex;
				flex-direction: row;
				color: var(--m-color-neutral-ink);
			}
		`;
	}

	static get properties() {
		return {
			hue: { type: Number },
			saturation: { type: Number },
			hueShift: { type: Number },
		};
	}

	hue = 0;
	saturation = 1;
	hueShift = 0;
	preset = getPreset();

	render() {
		return html`
			<div class="range">
				${['paper', 'wash', 'light', 'mid', 'heavy', 'ink'].map(
					(name) =>
						html`<main-color-range-debug-swatch
							hue="${this.hue}"
							saturation="${this.saturation}"
							hueShift="${this.hueShift}"
							stepName="${name}"
							mode="light"
						></main-color-range-debug-swatch>`,
				)}
			</div>
			<div class="range @mode-dark">
				${['paper', 'wash', 'light', 'mid', 'heavy', 'ink'].map(
					(name) =>
						html`<main-color-range-debug-swatch
							hue="${this.hue}"
							hueShift="${this.hueShift}"
							saturation="${this.saturation}"
							stepName="${name}"
							mode="dark"
						></main-color-range-debug-swatch>`,
				)}
			</div>
		`;
	}
}

class MainColorRangeDebugSwatch extends LitElement {
	static get styles() {
		return css`
			:host {
				position: relative;
				font-size: 10px;
				white-space: wrap;
				width: 100px;
				height: 100px;
			}

			.pip {
				position: absolute;
				transform: translateY(50%);
				background: black;
				border-radius: 50%;
				width: 10px;
				height: 10px;
				border: 1px solid white;
				opacity: 0.8;

				&.l {
					background: white;
					border-color: black;
				}
				&.c {
					background: cyan;
				}
				&.h {
					background: magenta;
				}
			}

			.elements {
				display: flex;
				flex-direction: column;
			}
		`;
	}

	static get properties() {
		return {
			hue: { type: Number },
			hueShift: { type: Number },
			saturation: { type: Number },
			stepName: { type: String },
			mode: { type: String },
		};
	}

	hue = 0;
	hueShift = 0;
	saturation = 1;
	stepName = '';
	mode = 'light';
	preset = getPreset();
	render() {
		const range =
			this.mode === 'light' ?
				createColorLightModeRange(
					{
						hue: this.hue,
						hueShift: this.hueShift,
						saturation: this.saturation,
					},
					this.preset.$.mode.global.color as any,
				)
			:	createColorDarkModeRange(
					{
						hue: this.hue,
						hueShift: this.hueShift,
						saturation: this.saturation,
					},
					this.preset.$.mode.global.color as any,
				);
		const compiled = range[this.stepName as 'mid'].equation.printComputed({
			propertyValues: {
				[this.preset.$.mode.global.color.saturation.name as any]: '0.5',
			} as any,
			simplifier: getContext().simplifier,
		});
		const match = compiled.match(oklchMatcher) ?? [];
		return html`<div
			class="color-swatch"
			style="background: ${compiled}; width: 100px; height: 100px;"
			title="${range[this.stepName as 'mid'].equation.printDynamic({
				propertyValues: {},
			})}"
		>
			<div class="pip l" style="bottom: ${match[1] ?? 0}"></div>
			<div
				class="pip c"
				style="bottom: calc(${match[2] ?? 0} / 0.4 * 100%)"
			></div>
			<div
				class="pip h"
				style="bottom: calc(${match[3] ?? 0} / 360 * 100%)"
			></div>
			<div>${compiled}</div>
			<div class="elements">
				<span>${match[1] ?? 0}</span><span>${match[2] ?? 0}</span
				><span>${match[3] ?? 0}</span>
			</div>
		</div>`;
	}
}

ready.then(() => {
	customElements.define('main-color-range-debug', MainColorRangeDebug);
	customElements.define(
		'main-color-range-debug-swatch',
		MainColorRangeDebugSwatch,
	);
});
