import { getConfig } from '../registration.js';
import { groupTokens } from '../tokenGroups.js';

class TokenValues extends HTMLElement {
	constructor() {
		super();

		const config = getConfig();
		const schemaPath = this.getAttribute('schema-path');
		const schemaPathParts = schemaPath ? schemaPath.split('.') : [];
		const tokenSchema = schemaPathParts.reduce(
			(acc, part) => acc?.[part],
			config as any,
		);
		const tokens = groupTokens(tokenSchema);

		this.attachShadow({ mode: 'open' }).innerHTML = `
			<div class="root">
				${Object.entries(tokens.simple)
					.map(
						([purpose, tokens]) =>
							`<div class="token-group">
								<h3>${purpose}</h3>
								<div class="token-values">
								${tokens
									.map((token) => {
										return `
										<div class="token-value">
											<strong>${token.name}</strong>
											<arbor-token-value-preview value="${token.var}" purpose="${token.purpose}"></arbor-token-value-preview>
										</div>`;
									})
									.join('\n')}
								</div>
							</div>`,
					)
					.join('\n')}
				<div class="token-group">
					<h3>Typography</h3>
					<div class="token-values">
						${Object.entries(tokens.typography)
							.map(([level, { size, weight, lineHeight }]) => {
								const sizeVar = size ? size.var : 'unknown';
								const weightVar = weight ? weight.var : 'unknown';
								const lineHeightVar = lineHeight ? lineHeight.var : 'unknown';
								return `
									<div class="token-value">
										<div>
											<strong>${level}</strong>
											<div>size: ${sizeVar}</div>
											<div>weight: ${weightVar}</div>
											<div>line-height: ${lineHeightVar}</div>
										</div>
										<arbor-token-font-values-preview size="${sizeVar}" weight="${weightVar}" line-height="${lineHeightVar}"></arbor-token-font-values-preview>
									</div>
								`;
							})
							.join('\n')}
					</div>
				</div>
			</div>
			<style>
			.root {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
			}
				.token-group {
					margin-bottom: 2rem;
					background-color: white;
					border: 1px solid black;
					padding: 0.25rem;
				}
					.token-values {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
						gap: 0.125rem;
					}
				.token-value {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					padding: 0.2rem;
				}
			</style>
		`;
	}
}

customElements.define('arbor-token-values', TokenValues);
