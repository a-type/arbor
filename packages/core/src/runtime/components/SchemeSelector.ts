import { ArborElement } from './BaseElement.js';

class SchemeSelector extends ArborElement {
	constructor() {
		super();
		this.render();
	}

	render = () => {
		const schemeNames = Object.keys(this.config.primitives.colors);
		const selected = this.getAttribute('selected') || 'base';
		this.shadowRoot!.innerHTML = `<div data-scheme-${selected}>
			<select data-scheme-select name="scheme" aria-label="Select scheme" style="position: sticky; top: 0;">
				${schemeNames
					.map(
						(schemeName) =>
							`<option value="${schemeName}" ${schemeName === selected ? 'selected' : ''}>${schemeName}</option>`,
					)
					.join('\n')}
			</select>
			<slot></slot>
		</div>`;
		const modeSelect = this.shadowRoot?.querySelector(
			'[data-scheme-select]',
		) as HTMLSelectElement | null;
		modeSelect?.addEventListener('change', () => {
			const selectedMode = modeSelect.value;
			this.setAttribute('selected', selectedMode);
		});
	};
	static get observedAttributes() {
		return ['selected'];
	}
	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	) {
		if (name === 'selected' && oldValue !== newValue) {
			this.render();
		}
	}
}

customElements.define('arbor-scheme-selector', SchemeSelector);
