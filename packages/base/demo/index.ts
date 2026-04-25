import { generateStylesheet } from '../src/stylesheet/generateStylesheet.js';
import { arbor } from './arbor.js';
import { modeSchema } from './modes.js';

const baseCss = generateStylesheet(arbor);

document.head.insertAdjacentHTML('beforeend', `<style>${baseCss}</style>`);

class ModeComponentExample extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'closed' }).innerHTML = `
			<div class="example">
				<input class="input" />
				<button class="button primary">Primary</button>
				<button class="button secondary">Secondary</button>
			</div>
			<style>
				.example {
					display: flex;
					gap: 1rem;
					padding: 1rem;
				}
				.input {
					padding: calc(0.5rem * ${modeSchema.PROPS.DENSITY.VAR}) calc(1rem * ${modeSchema.PROPS.DENSITY.VAR});
					border: 1px solid ${modeSchema.PROPS.CONTROL.BORDER.VAR};
					background-color: ${modeSchema.PROPS.CONTROL.BG.VAR};
					color: ${modeSchema.PROPS.CONTROL.FG.VAR};
				}
				.button {
					padding: calc(0.5rem * ${modeSchema.PROPS.DENSITY.VAR}) calc(1rem * ${modeSchema.PROPS.DENSITY.VAR});
					border-radius: 0.25rem;
					&.primary {
						border: 1px solid ${modeSchema.PROPS.ACTION.PRIMARY.BORDER.VAR};
						background-color: ${modeSchema.PROPS.ACTION.PRIMARY.BG.VAR};
						color: ${modeSchema.PROPS.ACTION.PRIMARY.FG.VAR};
					}
					&.secondary {
						border: 1px solid ${modeSchema.PROPS.ACTION.SECONDARY.BORDER.VAR};
						background-color: ${modeSchema.PROPS.ACTION.SECONDARY.BG.VAR};
						color: ${modeSchema.PROPS.ACTION.SECONDARY.FG.VAR};
					}
				}
			</style>
		`;
	}
}

customElements.define('mode-component-example', ModeComponentExample);

class ModeLayer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'closed' }).innerHTML = `
			<div>
				<label>${this.className}</label>
				<slot></slot>
			</div>
			<style>
				div {
					display: flex;
					flex-direction: column;
					gap: 1rem;
					padding: 1rem;
					border: 1px solid ${modeSchema.PROPS.SURFACE.ANCILLARY.BORDER.VAR};
					background-color: ${modeSchema.PROPS.SURFACE.ANCILLARY.BG.VAR};
					color: ${modeSchema.PROPS.SURFACE.ANCILLARY.FG.VAR};
				}
			</style>
		`;
	}
}

customElements.define('mode-layer', ModeLayer);

class ColorRange extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'closed' }).innerHTML = `
			<div class="range">
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.PAPER.VAR}">Paper</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.WASH.VAR}">Wash</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.LIGHTER.VAR}">Lighter</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.LIGHT.VAR}">Light</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.DEFAULT.VAR}">Default</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.DARK.VAR}">Dark</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.DARKER.VAR}">Darker</div>
				<div class="color" style="background-color: ${modeSchema.PROPS.MAIN_COLOR.INK.VAR}">Ink</div>
			</div>
			<style>
				.range {
					display: flex;
					gap: 0.5rem;
				}
				.color {
					flex: 1;
					padding: 1rem;
					border-radius: 0.25rem;
					color: ${modeSchema.PROPS.SURFACE.ANCILLARY.FG.VAR};
					border: 1px solid ${modeSchema.PROPS.SURFACE.ANCILLARY.BORDER.VAR};
					text-align: center;
				}
			</style>
		`;
	}
}

customElements.define('color-range', ColorRange);
