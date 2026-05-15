import { SchemeDefinition } from '@arbor-css/colors';
import { $globalProps } from '@arbor-css/globals';
import { ArborElement } from '../src/runtime/components/index';
import arbor from './arbor.js';

const oklchMatcher = /oklch\(([0-9.%]+),?\s?([0-9.%]+),?\s?([0-9.%]+)\)/;

const globalPropsFlat = Object.values($globalProps);

class MainColorRangeDebug extends ArborElement {
	constructor() {
		super();
	}

	connectedCallback() {
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
		const range = (
			(arbor.meta.config.colors.schemes as any).dark as SchemeDefinition
		).getColorRange(arbor.meta.config.colors.ranges[colorName]);
		this.shadowRoot.innerHTML = `
			<div class="range @scheme-dark">
				${(['paper', 'wash', 'light', 'mid', 'heavy', 'ink'] as const)
					.map((name) => {
						const compiled = range[name].equation.printComputed({
							propertyValues: globals,
							skipBaking: false,
						});
						const match = compiled.match(oklchMatcher) ?? [];
						return `<div class="color-swatch" style="background: ${arbor.primitives.$tokens.colors[colorName][name].var}; width: 100px; height: 100px;" title="${range[name].equation.printDynamic({ propertyValues: {} })}">
					<div class="pip l" style="bottom: ${match[1] ?? 0}"></div>
					<div class="pip c" style="bottom: calc(${match[2] ?? 0} / 0.4 * 100%)"></div>
					<div class="pip h" style="bottom: calc(${match[3] ?? 0} / 360 * 100%)"></div>
					<div>${compiled}</div>
					<div class="elements"><span>${match[1] ?? 0}</span><span>${match[2] ?? 0}</span><span>${match[3] ?? 0}</span></div>
				</div>`;
					})
					.join('')}
			</div>
			<style>
				.range {
					display: flex;
					color: ${arbor.modes.base.schema.$tokens.color.neutral.ink.var};
				}
				.color-swatch {
					position: relative;
					font-size: 10px;
					whitespace: wrap;
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
			</style>
		`;
	}
}

customElements.define('main-color-range-debug', MainColorRangeDebug);
