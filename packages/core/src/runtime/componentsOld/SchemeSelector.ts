import { ArborElement } from './BaseElement.js';

class SchemeSelector extends ArborElement {
	constructor() {
		super();
		this.render();
	}

	render = () => {
		const schemeNames = ['light', 'dark'];
		const selected = this.getAttribute('selected') || 'base';
		this.shadowRoot!.innerHTML = `<div class="@scheme-${selected}" style="background: var(--m-surface-ambient-bg); color: var(--m-surface-ambient-fg);">
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
		const schemeSelect = this.shadowRoot?.querySelector(
			'[data-scheme-select]',
		) as HTMLSelectElement | null;
		schemeSelect?.addEventListener('change', () => {
			const selectedMode = schemeSelect.value;
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
