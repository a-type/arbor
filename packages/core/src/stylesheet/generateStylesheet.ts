import { AnyArborPreset, getInternals } from '@arbor-css/preset/config';
import { flattenTokenSchema } from '@arbor-css/tokens';
import { modeToCss } from './modeToCss.js';

export function generateStylesheet(
	config: AnyArborPreset,
	{
		layer: cascadeLayerName = 'arbor',
	}: {
		layer?: string | false;
	} = {},
): string {
	const { modes } = getInternals(config);
	const systemProps = config.$.system;

	const allModeProps = flattenTokenSchema(config.$.mode);

	return `/* Auto-generated CSS - do not edit directly */
${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
${[config.baseMode, ...modes]
	.map((modeValue) => {
		return modeToCss(modeValue, config);
	})
	.join('\n\n')}

@media (prefers-color-scheme: light) {
	${systemProps.env.prefersLight.assign(1)}
	${systemProps.env.prefersDark.assign(0)}
}
@media (prefers-color-scheme: dark) {
	${systemProps.env.prefersLight.assign(0)}
	${systemProps.env.prefersDark.assign(1)}
}

/* Function definitions */
${Object.values(config.functions)
	.map((fn) => fn.definition)
	.filter(Boolean)
	.join('\n\n')}

${allModeProps
	.map((PROP) => PROP.definition)
	.filter(Boolean)
	.join('\n\n')}

${cascadeLayerName ? `}` : ''}
`
		.trim()
		.replace(/\n+$/, '\n');
}
