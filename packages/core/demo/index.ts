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
					padding: calc(0.5rem * ${modeSchema.$tokens.density.var}) calc(1rem * ${modeSchema.$tokens.density.var});
					border: 1px solid ${modeSchema.$tokens.control.border.var};
					background-color: ${modeSchema.$tokens.control.bg.var};
					color: ${modeSchema.$tokens.control.fg.var};
				}
				.button {
					padding: calc(0.5rem * ${modeSchema.$tokens.density.var}) calc(1rem * ${modeSchema.$tokens.density.var});
					border-radius: 0.25rem;
					&.primary {
						border: 1px solid ${modeSchema.$tokens.action.primary.border.var};
						background-color: ${modeSchema.$tokens.action.primary.bg.var};
						color: ${modeSchema.$tokens.action.primary.fg.var};
					}
					&.secondary {
						border: 1px solid ${modeSchema.$tokens.action.secondary.border.var};
						background-color: ${modeSchema.$tokens.action.secondary.bg.var};
						color: ${modeSchema.$tokens.action.secondary.fg.var};
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
					border: 1px solid ${modeSchema.$tokens.surface.secondary.border.var};
					background-color: ${modeSchema.$tokens.surface.secondary.bg.var};
					color: ${modeSchema.$tokens.surface.secondary.fg.var};
					border-radius: 0.25rem;
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
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.paper.var}; color: ${modeSchema.$tokens.mainColor.ink.var}">Paper</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.wash.var}; color: ${modeSchema.$tokens.mainColor.ink.var}">Wash</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.lighter.var}; color: ${modeSchema.$tokens.mainColor.ink.var}">Lighter</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.light.var}; color: ${modeSchema.$tokens.mainColor.ink.var}">Light</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.mid.var}; color: ${modeSchema.$tokens.mainColor.ink.var}">Default</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.heavy.var}; color: ${modeSchema.$tokens.mainColor.paper.var}">Heavy</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.heavier.var}; color: ${modeSchema.$tokens.mainColor.paper.var}">Heavier</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.mainColor.ink.var}; color: ${modeSchema.$tokens.mainColor.paper.var}">Ink</div>
			</div>
			<div class="range">
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.paper.var}; color: ${modeSchema.$tokens.neutralColor.ink.var}">Paper</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.wash.var}; color: ${modeSchema.$tokens.neutralColor.ink.var}">Wash</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.lighter.var}; color: ${modeSchema.$tokens.neutralColor.ink.var}">Lighter</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.light.var}; color: ${modeSchema.$tokens.neutralColor.ink.var}">Light</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.mid.var}; color: ${modeSchema.$tokens.neutralColor.ink.var}">Default</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.heavy.var}; color: ${modeSchema.$tokens.neutralColor.paper.var}">Heavy</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.heavier.var}; color: ${modeSchema.$tokens.neutralColor.paper.var}">Heavier</div>
				<div class="color" style="background-color: ${modeSchema.$tokens.neutralColor.ink.var}; color: ${modeSchema.$tokens.neutralColor.paper.var}">Ink</div>
			</div>
			<style>
				.range {
					display: flex;
				}
				.color {
					flex: 1;
					padding: calc(${modeSchema.$tokens.density.var} * 1rem);
					color: ${modeSchema.$tokens.surface.ambient.fg.var};
					text-align: center;
				}
			</style>
		`;
	}
}

customElements.define('color-range', ColorRange);
