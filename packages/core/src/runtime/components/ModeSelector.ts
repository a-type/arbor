import { ArborElement } from './BaseElement.js';

class ModeSelector extends ArborElement {
	constructor() {
		super();
		this.render();
	}

	render = () => {
		const modeNames = Object.keys(this.config.modes);
		const selected = this.getAttribute('selected') || 'base';
		this.shadowRoot.innerHTML = `<div data-mode-${selected}>
			<select data-mode-select name="mode" aria-label="Select mode" style="position: sticky; top: 16px;">
				${modeNames
					.map(
						(modeName) =>
							`<option value="${modeName}" ${modeName === selected ? 'selected' : ''}>${modeName}</option>`,
					)
					.join('\n')}
			</select>
			<slot></slot>
		</div>`;
		const modeSelect = this.shadowRoot?.querySelector(
			'[data-mode-select]',
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

customElements.define('arbor-mode-selector', ModeSelector);
