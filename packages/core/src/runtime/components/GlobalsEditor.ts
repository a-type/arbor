import GUI from 'lil-gui';
import { getConfig } from '../registration.js';
import { ArborElement } from './BaseElement.js';

class GlobalsEditor extends ArborElement {
	connectedCallback() {
		const gui = new GUI();
		gui.close();
		const config = getConfig();

		const globalsFolder = gui.addFolder('Globals');

		for (const [globalKey, token] of Object.entries(config.$.system.global)) {
			let entry =
				token.type === 'color' ?
					globalsFolder.addColor(config.context.globals, globalKey as any)
				:	globalsFolder.add(config.context.globals, globalKey as any);

			entry.name(globalKey).onChange((v: any) => {
				document.documentElement.style.setProperty(token.name, v.toString());
			});
			if (token.type === 'number') {
				entry = entry.min(0).max(2).step(0.1);
			}
		}
	}
}

customElements.define('arbor-globals-editor', GlobalsEditor);
