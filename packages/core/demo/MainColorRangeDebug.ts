import { loadSimplifier } from '@arbor-css/css-eval/browser';
import { createColorDarkModeRange } from '../src/presets/arborPreset';
import arbor from './arbor.js';

const oklchMatcher = /oklch\(([0-9.%]+),?\s?([0-9.%]+),?\s?([0-9.%]+)\)/;

const globalPropsFlat = Object.values(arbor.$.mode.global);

class MainColorRangeDebug extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {
		const colorName = this.getAttribute('color') ?? 'primary';
		const globals = globalPropsFlat.reduce(
			(acc, prop) => {
				acc[prop.name] = getComputedStyle(document.body).getPropertyValue(
					prop.name,
				);
				return acc;
			},
			{} as Record<string, string>,
		);
		const range = createColorDarkModeRange(
			{
				hue: 90.8,
			},
			arbor.$.mode.global,
		);
		const simplifier = await loadSimplifier();
		const content = `${(
			['paper', 'wash', 'light', 'mid', 'heavy', 'ink'] as const
		)
			.map((name) => {
				const compiled = range[name].equation.printComputed({
					propertyValues: globals,
					skipBaking: false,
					simplifier,
					purpose: 'color',
				});
				const match = compiled.match(oklchMatcher) ?? [];
				return `<div class="color-swatch" style="background: ${arbor.$.mode.color.palette[colorName as 'primary'][name].var}; width: 100px; height: 100px;" title="${range[name].equation.printDynamic({ propertyValues: {} })}">
					<div class="pip l" style="bottom: ${match[1] ?? 0}"></div>
					<div class="pip c" style="bottom: calc(${match[2] ?? 0} / 0.4 * 100%)"></div>
					<div class="pip h" style="bottom: calc(${match[3] ?? 0} / 360 * 100%)"></div>
					<div>${compiled}</div>
					<div class="elements"><span>${match[1] ?? 0}</span><span>${match[2] ?? 0}</span><span>${match[3] ?? 0}</span></div>
				</div>`;
			})
			.join('')}`;
		this.innerHTML = `
			<div class="range">
				${content}
			</div>
			<div class="range @mode-dark">
				${content}
			</div>
		`;
	}
}

customElements.define('main-color-range-debug', MainColorRangeDebug);
