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
					padding: calc(0.5rem * ${modeSchema.$props.density.var}) calc(1rem * ${modeSchema.$props.density.var});
					border: 1px solid ${modeSchema.$props.control.border.var};
					background-color: ${modeSchema.$props.control.bg.var};
					color: ${modeSchema.$props.control.fg.var};
				}
				.button {
					padding: calc(0.5rem * ${modeSchema.$props.density.var}) calc(1rem * ${modeSchema.$props.density.var});
					border-radius: 0.25rem;
					&.primary {
						border: 1px solid ${modeSchema.$props.action.primary.border.var};
						background-color: ${modeSchema.$props.action.primary.bg.var};
						color: ${modeSchema.$props.action.primary.fg.var};
					}
					&.secondary {
						border: 1px solid ${modeSchema.$props.action.secondary.border.var};
						background-color: ${modeSchema.$props.action.secondary.bg.var};
						color: ${modeSchema.$props.action.secondary.fg.var};
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
					border: 1px solid ${modeSchema.$props.surface.auxiliary.border.var};
					background-color: ${modeSchema.$props.surface.auxiliary.bg.var};
					color: ${modeSchema.$props.surface.auxiliary.fg.var};
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
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.paper.var}; color: ${modeSchema.$props.mainColor.ink.var}">Paper</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.wash.var}; color: ${modeSchema.$props.mainColor.ink.var}">Wash</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.lighter.var}; color: ${modeSchema.$props.mainColor.ink.var}">Lighter</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.light.var}; color: ${modeSchema.$props.mainColor.ink.var}">Light</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.mid.var}; color: ${modeSchema.$props.mainColor.ink.var}">Default</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.heavy.var}; color: ${modeSchema.$props.mainColor.paper.var}">Heavy</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.heavier.var}; color: ${modeSchema.$props.mainColor.paper.var}">Heavier</div>
				<div class="color" style="background-color: ${modeSchema.$props.mainColor.ink.var}; color: ${modeSchema.$props.mainColor.paper.var}">Ink</div>
			</div>
			<div class="range">
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.paper.var}; color: ${modeSchema.$props.neutralColor.ink.var}">Paper</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.wash.var}; color: ${modeSchema.$props.neutralColor.ink.var}">Wash</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.lighter.var}; color: ${modeSchema.$props.neutralColor.ink.var}">Lighter</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.light.var}; color: ${modeSchema.$props.neutralColor.ink.var}">Light</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.mid.var}; color: ${modeSchema.$props.neutralColor.ink.var}">Default</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.heavy.var}; color: ${modeSchema.$props.neutralColor.paper.var}">Heavy</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.heavier.var}; color: ${modeSchema.$props.neutralColor.paper.var}">Heavier</div>
				<div class="color" style="background-color: ${modeSchema.$props.neutralColor.ink.var}; color: ${modeSchema.$props.neutralColor.paper.var}">Ink</div>
			</div>
			<style>
				.range {
					display: flex;
				}
				.color {
					flex: 1;
					padding: calc(${modeSchema.$props.density.var} * 1rem);
					color: ${modeSchema.$props.surface.auxiliary.fg.var};
					text-align: center;
				}
			</style>
		`;
	}
}

customElements.define('color-range', ColorRange);
