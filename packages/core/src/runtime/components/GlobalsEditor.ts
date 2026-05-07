import { $globalProps } from '@arbor-css/globals';
import { isToken, Token } from '@arbor-css/tokens';
import GUI from 'lil-gui';
import { readProperties } from '../readProperties.js';
import { getConfig } from '../registration.js';
import { ArborElement } from './BaseElement.js';

class GlobalsEditor extends ArborElement {
	connectedCallback() {
		const gui = new GUI();
		const config = getConfig();

		const globalsFolder = gui.addFolder('Globals');
		globalsFolder.open();

		for (const [globalKey, token] of Object.entries($globalProps)) {
			let entry =
				token.type === 'color' ?
					globalsFolder.addColor(config.primitives.globals, globalKey as any)
				:	globalsFolder.add(config.primitives.globals, globalKey as any);

			entry.name(globalKey).onChange((v: any) => {
				document.documentElement.style.setProperty(token.name, v.toString());
			});
			if (token.type === 'number') {
				entry = entry.min(0).max(2).step(0.1);
			}
		}

		const primitivesFolder = gui.addFolder('Primitives');
		primitivesFolder.open();

		function addToken(parent: any, key: string, token: Token, folder: GUI) {
			let entry =
				token.type === 'color' ?
					folder.addColor(parent, key)
				:	folder.add(parent, key);

			entry.name(key).onChange((v: any) => {
				document.documentElement.style.setProperty(token.name, v.toString());
				// and all scheme permutations...
				for (const scheme of Object.keys(config.primitives.colors)) {
					const prefix = config.primitives.schemeTags[scheme] ?? scheme;
					document.documentElement.style.setProperty(
						token.prefixed(prefix).name,
						v.toString(),
					);
				}
			});
		}

		const values = readProperties(config.primitives.$tokens);
		console.log(values);

		for (const [firstLayerKey, firstTokenLayer] of Object.entries(
			config.primitives.$tokens,
		)) {
			if (isToken(firstTokenLayer)) {
				addToken(values, firstLayerKey, firstTokenLayer, primitivesFolder);
			} else {
				const primitiveFolder = primitivesFolder.addFolder(firstLayerKey);
				primitiveFolder.open();
				for (const [secondLayerKey, secondTokenLayer] of Object.entries(
					firstTokenLayer,
				)) {
					if (isToken(secondTokenLayer)) {
						addToken(
							values[firstLayerKey],
							secondLayerKey,
							secondTokenLayer,
							primitiveFolder,
						);
					} else {
						const secondLayerFolder = primitiveFolder.addFolder(secondLayerKey);
						secondLayerFolder.open();
						for (const [thirdLayerKey, thirdTokenLayer] of Object.entries(
							secondTokenLayer,
						)) {
							if (isToken(thirdTokenLayer)) {
								addToken(
									values[firstLayerKey][secondLayerKey],
									thirdLayerKey,
									thirdTokenLayer,
									secondLayerFolder,
								);
							}
						}
					}
				}
			}
		}
	}
}

customElements.define('arbor-globals-editor', GlobalsEditor);
